// THE KAIJU FINALE: what's said (ALL CAPS, American spelling; clean / shitty pants / naked wherever it's his or about
// him). Pure data, nothing drawn (tools/voices reads it in node). Every line here is in FINALE_VOICE_LINES (endgame/
// lines.ts folds it into ENDGAME_VOICE_LINES: extract.ts and m2pack.ts record it with npm run voices).
//
// Who talks: Satan (m2.satan, as in Spooky Land), the widow Zarblax out of her saucer (m2.fin.zarblax: her saucer
// voice without the radio), her saucer crew (m2.space.alien), Meathead, Ben (m2.ben, only with all 8 pieces given),
// the tiny people of each land as it's flattened (their own voices from their own lands: the callbacks), and the
// Space Needle's victim (m2.fin.musk, the mini-cutscene).

export interface ByPants { clean: string[]; shitty: string[]; nude: string[] }
const bp = (clean: string[], shitty: string[], nude: string[]): ByPants => ({ clean, shitty, nude });
/** One pool all three ways (a line that never mentions him). */
const same = (l: string[]): ByPants => ({ clean: l, shitty: l, nude: l });

export const SATAN_VOICE = 'm2.satan';
export const WIDOW_VOICE = 'm2.fin.zarblax';
export const CREW_VOICE = 'm2.space.alien';
export const BEN_VOICE = 'm2.ben';
export const MUSK_VOICE = 'm2.fin.musk';

// ---------------------------------------------------------------------------------------------------------------
// The opening (a skippable cutscene: no input, no HUD, bubbles, nobody over anybody)

/** The two of them, squabbling over him (the owner's: "still fighting over their claim to meathead"). */
export const SATAN_CLAIM = ['HE OWES ME A SOUL, FRISBEE. I HAD DIBS AT THE CASTLE.', 'BACK IN YOUR HUBCAP. THE FAT ONE IS MINE.'];
export const WIDOW_CLAIM = ['HE MADE ME A WIDOW, HORN BOY. HE GOES IN A JAR. MY JAR.', "I'VE GOT A JAR WITH HIS NAME ON IT. LABEL MAKER AND EVERYTHING."];
export const SATAN_BACK = ["JARS ARE FOR PICKLES. HE'S GOING IN THE LAKE.", 'YOUR HUSBAND WAS YOUR BROTHER. SIT DOWN.'];
/** Him, walking up on the two of them (they glance over). */
export const MH_ARRIVE = bp(
  ['MORNING, ASSHOLES. WHO WANTS TO DIE FIRST?', 'YOU TWO STILL FIGHTING OVER ME? I GET IT. LOOK AT ME.'],
  ["MORNING. DON'T MIND THE PANTS. WHO'S FIRST?", "YOU TWO STILL FIGHTING OVER ME? EVEN LIKE THIS? FLATTERED."],
  ['MORNING. YES, I WALKED HERE NAKED. WHO DIES FIRST?', 'STILL FIGHTING OVER ME? I GET IT. LOOK AT ALL OF ME.'],
);
/** What he's carrying: their kids (each over the other's look at their own). */
export const WIDOW_SEE = ['...IS THAT MY BABY?', '...ZORZARBLAX?'];
export const SATAN_SEE = ["...THAT'S MY BOY.", '...MEHPHISTO? MY MOODY LITTLE BOY?'];
/** After the gross-ups: grief, the gag way. */
export const WIDOW_GRIEF = ['HE HAD HIS FATHER\'S EYE. HE HAD ALL OF HIS FATHER, REALLY.', 'I CARRIED HIM FOR NINE YEARS.'];
export const SATAN_GRIEF = ['HE NEVER SAID HE LOVED ME. NOW HE NEVER WILL.', 'HE WAS GOING TO BE A DISAPPOINTMENT. MY DISAPPOINTMENT.'];
export const MH_KIDS = bp(
  ['THEY HAD IT COMING. ONE OF THEM HAD THREE ARMS.', "WHAT? THEY STARTED IT. I'M PRETTY SURE."],
  ["THEY HAD IT COMING. I SHIT MYSELF FIGHTING THEM. THAT'S ON THEM.", 'WHAT? THE SMELL IS FROM THE FIGHT. MOSTLY.'],
  ['THEY HAD IT COMING. THEY SAW ME NAKED. THEY WERE DONE ANYWAY.', "WHAT? I LOST MY PANTS KILLING THEM. WE'RE EVEN."],
);
/** The truce. */
export const WIDOW_TRUCE = ['TRUCE, HORN BOY. WE KILL HIM TOGETHER. THEN I KILL YOU.', 'TRUCE. HIM FIRST. THEN YOU.'];
export const SATAN_TRUCE = ['FINE. TOGETHER. THEN YOU GO IN THE LAKE TOO.', "DEAL. BUT YOU'RE TOO SHORT TO HELP."];
/** Out of the saucer, onto the asphalt: "EMBIGGEN ME". */
export const WIDOW_EMBIGGEN = ["BOYS! EMBIGGEN MOMMY! ALL THE WAY UP!", 'BOYS! THE BIG RAY! MAKE MOMMY HUGE!'];
export const CREW_EMBIGGEN = ['EMBIGGENING, MA\'AM!', 'YES, MOTHER! FULL POWER!'];
export const SATAN_IMPRESSED = ['...HUH. NOT BAD FOR A FRISBEE.', '...OKAY. NOW YOU\'RE TALL.'];
/** Him, walking into the ray. */
export const MH_RAY = bp(
  ['OH, A FREE RAY? I\'M IN.', 'MOVE. ME NEXT. I LOVE A RAY.'],
  ['A RAY. MAYBE IT SHRINKS THE SHIT.', 'ME NEXT. DON\'T EMBIGGEN THE PANTS.'],
  ['A RAY. AIM IT AT MY DICK. WORTH A TRY.', 'ME NEXT. ALL OF ME. ESPECIALLY THE BOTTOM HALF.'],
);
/** Ben, in after him (only with all eight given). */
export const BEN_RAY = ['THE BIGGER THE MAN, THE BIGGER THE PUMP. MOVE OVER.', 'NEVER SKIP A FREE PUMP. SCOOT.'];
export const MH_BEN_RAY = bp(['CON-FUCK-TIOUS! YOU CAME!'], ['CON-FUCK-TIOUS! DON\'T EMBIGGEN BEHIND ME!'], ['CON-FUCK-TIOUS! DON\'T LOOK DOWN!']);
/** Giant. */
export const MH_GIANT = bp(
  ['HOLY SHIT. I\'M HUGE.', 'I\'M BIGGER THAN THE PARK. FINALLY.'],
  ['HOLY SHIT. I\'M HUGE. SO IS THE SHIT.', 'I\'M BIGGER THAN THE PARK. THE SMELL TOO.'],
  ['HOLY SHIT. I\'M HUGE. ALL OF ME. YOU\'RE WELCOME, FLORIDA.', 'BIGGER THAN THE PARK. AND I\'M HANGING OVER IT.'],
);
export const SATAN_GO = ['TO THE PARK. WE GRIND HIM INTO IT.', 'COME, FRISBEE. WE STOMP.'];
export const WIDOW_GO = ['THIS WAY. I PARKED BY THE GIFT SHOP.', 'FOLLOW ME, HORN BOY. MIND THE TOURISTS.'];

// ---------------------------------------------------------------------------------------------------------------
// The run

/** AMERICA USA first, going in (the hub's gate land, flattened on the way). */
export const MH_AMERICA = bp(['SORRY, AMERICA.', 'AMERICA USA. LOVE IT. LEAVE IT. FLAT.'], ['SORRY, AMERICA. YOU SMELL LIKE ME NOW.'], ['SORRY, AMERICA. NAKED AND STOMPING. VERY PATRIOTIC.']);
/** Into each land (the stretch's first half). */
export const MH_LAND: Record<string, ByPants> = {
  hollywood: bp(['HOLLYWOOD. FINALLY BIGGER THAN THE STARS.'], ['HOLLYWOOD. THE STARS CAN SMELL ME FROM HERE.'], ['HOLLYWOOD. NOW THEY GET A REAL NUDE SCENE.']),
  fantasy: bp(['FAIRY LAND. FEE FI FO FUCK YOU.'], ['FAIRY LAND. THE GIANT SHIT HIMSELF. CLASSIC TALE.'], ['FAIRY LAND. THE NAKED GIANT. THEY MADE A STORY ABOUT ME.']),
  adventure: bp(['JUNGLE LAND. NOW I\'M THE BIG ANIMAL.'], ['JUNGLE LAND. I\'M THE THING THAT SMELLS.'], ['JUNGLE LAND. KING OF THE JUNGLE. NO LOINCLOTH.']),
  foreign: bp(['FOREIGN LANDS. I\'M TAKING OVER THE WORLD. ALL TEN OF THEM.'], ['FOREIGN LANDS. AN INTERNATIONAL INCIDENT IN MY PANTS.'], ['FOREIGN LANDS. EUROPE\'S USED TO NUDITY.']),
  space: bp(['FUTURE LAND. THE FUTURE IS FLAT.'], ['FUTURE LAND. THE FUTURE SMELLS.'], ['FUTURE LAND. THE FUTURE IS NAKED.']),
  frontier: bp(['WILDERNESS LAND. THIS TOWN AIN\'T BIG ENOUGH. FOR ME.'], ['WILDERNESS LAND. I SHIT MY CHAPS.'], ['WILDERNESS LAND. NAKED COWBOY. THE REAL KIND.']),
  spooky: bp(['SPOOKY LAND. BOO, MOTHERFUCKERS.'], ['SPOOKY LAND. SCARIEST THING HERE IS MY PANTS.'], ['SPOOKY LAND. SCARIEST THING HERE IS MY DICK.']),
  cartoon: bp(['CARTOON LAND. LAST ONE. THEN NAP.'], ['CARTOON LAND. LAST ONE. THEN A SHOWER.'], ['CARTOON LAND. LAST ONE. THEN PANTS.']),
};
/** Weakness hints (his own, only if he's got the weapon and Ben's not there to say it): the first time a weakness hit
 *  lands in a section. */
export const MH_WEAK = bp(
  ['OH, THEY HATE THAT. MORE.', 'THAT ONE STAGGERS \'EM. KEEP IT UP.'],
  ['THAT ONE WORKS. LIKE THE CHILI DID.', 'THEY HATE THAT. KEEP DUMPING IT ON.'],
  ['THAT ONE WORKS. SWINGING FREE.', 'THEY HATE THAT. AND THE VIEW.'],
);
/** A boss stunned: the grab's on (once a section). */
export const MH_STUNNED = bp(['NIGHT NIGHT. NOW YOU\'RE MINE.', 'DOWN. GOOD. NOW I GRAB.'], ['DOWN. NOW I HUG YOU WITH SHIT PANTS.', 'STAY DOWN. THIS IS GONNA SMELL.'], ['DOWN. NOW I GRAB. NAKED.', 'STAY DOWN. DON\'T LOOK UP.']);
/** Throwing. */
export const MH_THROW = bp(
  ['YOU LIKE RIDES? GO RIDE.', 'GET IN THE ATTRACTION!', 'FAST PASS!'],
  ['GET IN THE RIDE! I\'LL WAIT HERE AND STINK!', 'FAST PASS! FROM MY PANTS TO YOUR FACE!'],
  ['GET IN THE RIDE! NAKED TOSS!', 'FAST PASS! DON\'T GRAB ANYTHING ON THE WAY UP!'],
);
/** After the throw lands, on to the next (rare: the callbacks go first). */
export const MH_NEXT = bp(['NEXT.', 'WHAT\'S NEXT? I\'M HUNGRY.'], ['NEXT. I NEED A HOSE.'], ['NEXT. MY BALLS ARE COLD.']);
/** Stepping on a landmark (the odd one: the callbacks speak for most). */
export const MH_STOMP = bp(['OOPS.', 'WAS THAT IMPORTANT?', 'GOT IT ON MY FOOT.'], ['OOPS. IT\'S IN THE TREAD NOW.', 'SORRY. IT WAS LIKE THAT WHEN I SHIT ON IT.'], ['OOPS. RIGHT ON THE BALLS.', 'THAT TICKLED. EVERYWHERE.']);
/** The checkpoint (four lands flat). */
export const MH_HALF = bp(['HALFWAY. HALF THE PARK FLAT. GOOD START.'], ['HALFWAY. HALF THE PARK FLAT. AND HALF MY PANTS.'], ['HALFWAY. FOUR LANDS SAW EVERYTHING.']);
/** The end of the run, for now (the owner's ending goes after it). */
export const MH_END = bp(['THAT\'S THE WHOLE PARK. NOW WHAT?'], ['THAT\'S THE WHOLE PARK. I NEED A BIGGER TOILET.'], ['THAT\'S THE WHOLE PARK. I NEED BIGGER PANTS.']);

// ---------------------------------------------------------------------------------------------------------------
// Satan and the widow in the fight (every pool three ways: the owner's boss lines by player state)

export const SATAN_TAUNT = bp(
  ['YOUR SOUL TASTES LIKE GAS STATION NACHOS. I\'LL STILL EAT IT.', 'STAND STILL. I\'M TRYING TO DAMN YOU.', 'I INVENTED FIRE. FEEL IT.'],
  ['YOU SMELL LIKE MY LAKE. AND MY LAKE IS SHIT.', 'EVEN HELL WON\'T TAKE THOSE PANTS.', 'YOU SHAT YOURSELF. I DIDN\'T EVEN START.'],
  ['PUT SOMETHING ON. I\'M THE DEVIL AND I\'M EMBARRASSED.', 'I\'VE SEEN THE DAMNED. THEY HAD MORE DIGNITY.', 'COVER THAT. IT\'S SUNRISE. CHILDREN COULD SEE.'],
);
export const WIDOW_TAUNT = bp(
  ['HOLD STILL, SWEETIE. MOMMY HAS A JAR.', 'YOU KILLED MY HUSBAND. AND MY BROTHER. SAME GUY. STILL COUNTS.', 'I\'M GONNA PROBE YOU SO HARD.'],
  ['YOU SMELL LIKE THE POD TOILET. THE BROKEN ONE.', 'EVEN THE JAR WON\'T WANT YOU.', 'BOYS, GET THE BIG JAR. AND A MOP.'],
  ['NAKED? AT MY AGE? I\'M FLATTERED, ASSHOLE.', 'PUT IT AWAY OR I PROBE IT.', 'I RAISED A THREE-ARMED BOY. YOU STILL DISGUST ME.'],
);
export const SATAN_HURT = bp(
  ['OW. THAT\'S NEW.', 'WHO TAUGHT YOU THAT?', 'MY HORNS! WATCH THE HORNS!'],
  ['OW. AND THE SMELL. DOUBLE OW.', 'GET YOUR SHIT HANDS OFF ME!'],
  ['OW! AND I SAW IT SWING!', 'NOT WITH YOUR THING OUT!'],
);
export const WIDOW_HURT = bp(
  ['MY CURLERS!', 'OW! I\'M A WIDOW!', 'MY HOUSECOAT! IT\'S QUILTED!'],
  ['OW! AND IT STINKS!', 'MY CURLERS! THEY\'LL SMELL FOR A WEEK!'],
  ['OW! AND I SAW EVERYTHING!', 'MY EYE! MY ONE EYE SAW IT!'],
);
/** Stunned (the meter full: dazed, the prompt up over them). */
export const SATAN_DAZED = bp(['THE ROOM IS SPINNING. AND I MADE THE ROOM.', 'SO... MANY... SINNERS...'], ['DIZZY. AND THE SMELL. OH, THE SMELL.'], ['DIZZY. I KEEP SEEING IT.']);
export const WIDOW_DAZED = bp(['I SEE STARS. ACTUAL ONES. HOME.', 'WHERE\'S MY CIGARETTE...'], ['DIZZY. IS THAT HIM OR THE CIGARETTE?'], ['DIZZY. PUT IT AWAY. PUT IT AWAY.']);
/** Thrown (in the air). */
export const SATAN_THROWN = bp(['NOT THE RIDE!', 'PUT ME DOOOWN!'], ['NOT WITH THOSE HANDS!', 'YOU GOT SHIT ON MY WINGS!'], ['YOU TOUCHED ME WITH IT!', 'NOT NAKED! NOT NAAAKED!']);
export const WIDOW_THROWN = bp(['MY HIP!', 'I\'M A MOTHER!'], ['YOU GOT IT ON MY HOUSECOAT!', 'YOU STINKY SON OF A...'], ['IT TOUCHED MY HOUSECOAT!', 'NOT LIKE THIS!']);
/** Held up by the throat (the mobile beatdown), and each blow now and then. */
export const SATAN_NECK = bp(
  ["GHK. PUT ME. DOWN.", "NOT THE THROAT. I NEED IT FOR SCREAMING.", "I AM THE PRINCE OF DARKNESS. GHK."],
  ["YOUR HAND SMELLS LIKE YOUR PANTS.", "GET YOUR SHIT HAND OFF MY NECK.", "I CAN TASTE IT. I CAN TASTE YOUR HAND."],
  ["YOUR HAND. IS NAKED. LIKE THE REST.", "DON'T WALK ME AROUND. IT SWINGS.", "I CAN SEE IT FROM UP HERE. I CAN SEE IT."],
);
export const WIDOW_NECK = bp(
  ["GHK. MY PEARLS.", "PUT ME DOWN. I'M SOMEBODY'S MOTHER.", "MY CURLERS ARE COMING LOOSE."],
  ["YOUR HAND STINKS. LIKE THE POD TOILET.", "YOU'RE GETTING IT ON MY HOUSECOAT.", "OH GOD, THE SMELL IS COMING UP."],
  ["DON'T WALK. EVERYTHING SWINGS WHEN YOU WALK.", "I SEE IT. MY ONE EYE SEES ALL OF IT.", "PUT ME DOWN. PUT IT AWAY. BOTH."],
);
/** The one still standing, the other one thrown: enraged. */
export const SATAN_RAGE = bp(
  ["NOBODY THROWS MY PARTNER. NOBODY BUT ME.", "NOW I'M MAD. NOW YOU SEE HELL.", "THAT WAS MY RIDE OUT OF HERE."],
  ["NOW YOU DIE IN SHIT PANTS.", "I'LL BURN THOSE PANTS OFF YOU.", "NOW I'M MAD. AND YOU STILL STINK."],
  ["NOW I'M MAD. COVER UP AND DIE.", "I'LL BURN THAT THING OFF.", "NOW YOU DIE NAKED. LIKE A BABY."],
);
export const WIDOW_RAGE = bp(
  ["YOU THREW HORN BOY? HE WAS MINE TO KILL.", "NOW MOMMY'S MAD.", "THAT'S IT. NO MORE MISS NICE WIDOW."],
  ["NOW MOMMY'S MAD. AND YOU STINK.", "I'LL LASER THE SHIT RIGHT OFF YOU.", "YOU STINKY LITTLE MAN. NOW YOU DIE."],
  ["NOW MOMMY'S MAD. PUT IT AWAY.", "I'LL LASER THAT THING RIGHT OFF.", "YOU NAKED LITTLE MAN. NOW YOU DIE."],
);
/** Up out of the wreck, after it. */
export const SATAN_UP = ['I\'M FINE. THAT WAS ON PURPOSE.', 'THAT RIDE NEEDS A HEIGHT LIMIT.'];
export const WIDOW_UP = ['I\'M FINE. MY HIP IS NOT.', 'I LOST AN EARRING. THAT\'S ON YOU.'];
/** Ben holding one of them. */
export const SATAN_HELD = ['GET OFF ME, OLD MAN!', 'WHO IS THIS GUY?!', 'UNHAND ME, GYM TEACHER!'];
export const WIDOW_HELD = ['GET YOUR HANDS OFF MY HOUSECOAT!', 'WHO\'S THE OLD MAN?!', 'BOYS! GET THIS GUY OFF ME!'];

// ---------------------------------------------------------------------------------------------------------------
// The end (Cartoon Land: the water tower)

/** Out of health (Cartoon Land): down for good, no threat. */
export const KO_TAG = 'KNOCKED OUT';
// ---------------------------------------------------------------------------------------------------------------
// The finishers (the owner's: "Let them fall over or use the environment to kill them spectacularly. They will be
// 'dazed'. When that happens, the game is effectively won. Using one of the 9 weapons in their dazed state will kill
// them in a special way too. So there's 11"): each a short full cutscene (finale/finishers.ts). Meathead's lines three
// ways; theirs one pool each (they're past caring what he's wearing).

/** Dazed (both down: the game's won): what they mumble when a hit lands on them (text only while it's said). */
export const SATAN_DAZE = ['HEY.', 'OW. HEY.', 'NOT THE FACE.', 'I AM SO TIRED.'];
export const WIDOW_DAZE = ['HEY!', 'OW.', 'MY CURLERS...', 'NOT NOW, SWEETIE.'];
/** The prompt while they're dazed (his own words for it, not anybody else's game's). */
export const DAZED_PROMPT = "THEY'RE DONE. PICK HOW.";

export interface FinisherLines { mh: ByPants; satan: string[]; widow: string[]; after: ByPants }
export const FINISH: Record<string, FinisherLines> = {
  GUN: {
    mh: bp(['RAY GUN. FOR OLD TIMES.'], ['RAY GUN. THE ONLY THING CLEAN ON ME.'], ['RAY GUN. THE ONLY THING I\'M WEARING.']),
    satan: ['MY HOOVES ARE ALL THAT\'S LEFT. FIND MY HOOVES.'], widow: ['MY SLIPPERS. BURY MY SLIPPERS.'],
    after: bp(['TWO PAIRS OF SHOES. SOMEBODY\'S MOM GETS A PACKAGE.'], ['TWO PAIRS OF SHOES. I\'LL TAKE THE SLIPPERS. MINE ARE RUINED.'], ['TWO PAIRS OF SHOES. FINALLY SOMETHING TO WEAR.']),
  },
  SOUVENIR: {
    mh: bp(['ONE FROM THE GIFT SHOP.'], ['ONE FROM THE GIFT SHOP. NO RECEIPT.'], ['ONE FROM THE GIFT SHOP. I PAID IN EXPOSURE.']),
    satan: ['IS THAT THE EASTER ISLAND HEAD? THE WHOLE GUY?'], widow: ['IT\'S LOOKING AT ME. THE HEAD IS LOOKING AT ME.'],
    after: bp(['MADE IN A COUNTRY YOU CAN\'T PRONOUNCE. LIKE YOU TWO.'], ['FLAT. LIKE MY PANTS. WAIT. NOT LIKE MY PANTS.'], ['FLAT. TWO SOUVENIR RUGS. HELL AND SPACE.']),
  },
  SOUL_SUCKER: {
    mh: bp(['FEET FIRST. BOTH OF YOU.'], ['FEET FIRST. IT\'S USED TO WORSE.'], ['FEET FIRST. DON\'T LOOK UP.']),
    satan: ['NOT THE BAG! I\'VE SEEN WHAT\'S IN THE BAG!'], widow: ['IT\'S PULLING MY HOUSECOAT OFF!'],
    after: bp(['WASTE NOT. HOSE DOWN THE PARK.'], ['WASTE NOT. AND IT RINSED THE PANTS.'], ['WASTE NOT. WARM, TOO.']),
  },
  FLINTLOCK: {
    mh: bp(['ONE BALL. TWO HEADS. YEEHAW.'], ['ONE BALL. TWO HEADS. LINE UP.'], ['ONE BALL. TWO HEADS. THE LASER\'S POINTING AT MY THING. FINE.']),
    satan: ['YOU\'RE NOT ALLOWED TO HEADSHOT A BOSS! THERE\'S RULES!'], widow: ['MY ONE EYE! IT\'S MY ONLY ONE!'],
    after: bp(['THE RULES SAID NO HEADSHOTS. THE GAME\'S OVER. NO RULES.'], ['NO RULES AFTER THE GAME\'S WON. ALSO NO PANTS.'], ['NO RULES AFTER THE GAME\'S WON. NEVER WERE.']),
  },
  SPELLBOOK: {
    mh: bp(['ICE FOR THE HORNS. FIRE FOR THE CURLERS.'], ['ICE FOR THE HORNS. FIRE FOR THE CURLERS. NOTHING FOR MY PANTS.'], ['ICE FOR THE HORNS. FIRE FOR THE CURLERS. NONE NEAR ME.']),
    satan: ['COLD! I HAVEN\'T BEEN COLD IN SIX THOUSAND YEARS!'], widow: ['MY HAIR SPRAY! IT\'S FLAMMABLE! EVERYTHING I OWN IS FLAMMABLE!'],
    after: bp(['DEVIL POPSICLE. WIDOW FLAMBE.'], ['DEVIL POPSICLE. WIDOW FLAMBE. IT SMELLS BETTER THAN ME.'], ['DEVIL POPSICLE. WIDOW FLAMBE. AND A NAKED WIZARD.']),
  },
  STUNT_CAR: {
    mh: bp(['ACTION!'], ['ACTION! AND CUT THE SMELL IN POST.'], ['ACTION! THIS PART\'S NOT IN THE TRAILER.']),
    satan: ['THAT CAR\'S AS BIG AS ME!'], widow: ['WHERE\'S MY STUNT DOUBLE?!'],
    after: bp(['THAT\'S A WRAP. ON BOTH OF YOU.'], ['THAT\'S A WRAP. GIVE ME A TOWEL.'], ['THAT\'S A WRAP. GIVE ME A ROBE.']),
  },
  MALLET: {
    mh: bp(['FLAT AS A PANCAKE. BOTH.'], ['FLAT AS A PANCAKE. LIKE THE SEAT OF MY PANTS.'], ['FLAT AS A PANCAKE. LIKE MY ASS ON A COLD BENCH.']),
    satan: ['I SEE BIRDS. HELL HAS NO BIRDS.'], widow: ['I\'M A RUG. HE MADE ME A RUG.'],
    after: bp(['ROLL \'EM UP. TAKE \'EM HOME. NEW CARPET.'], ['ROLL \'EM UP. THEY\'LL HIDE THE STAINS.'], ['ROLL \'EM UP. SOMETHING TO SIT ON NAKED.']),
  },
  SPAWNER: {
    mh: bp(['DINNER, BOYS.'], ['DINNER, BOYS. DON\'T EAT THE PANTS.'], ['DINNER, BOYS. NOT ME. THEM.']),
    satan: ['THEY\'RE CHEWING MY WINGS! THESE ARE DESIGNER!'], widow: ['THEY\'RE IN MY CURLERS! THEY\'RE NESTING!'],
    after: bp(['TWO SKELETONS. ONE\'S GOT HORNS. ONE\'S GOT CURLERS.'], ['TWO SKELETONS. THE GOBLINS ARE STILL HUNGRY. I\'M LEAVING.'], ['TWO SKELETONS. THE GOBLINS ARE LOOKING AT ME. I\'M LEAVING.']),
  },
  CROSSBOW: {
    mh: bp(['STICK \'EM TILL THEY HURL.'], ['STICK \'EM TILL THEY HURL. JOIN THE CLUB.'], ['STICK \'EM TILL THEY HURL. NOT ON MY FEET.']),
    satan: ['I\'M GONNA BLOW! GET OUT OF THE WAY!'], widow: ['NOT ON MY HOUSECOAT! NOT ON MY... OH NO.'],
    after: bp(['THEY PUKED EACH OTHER TO DEATH. CLASSIC.'], ['THEY PUKED EACH OTHER TO DEATH. NOW WE ALL SMELL THE SAME.'], ['THEY PUKED EACH OTHER TO DEATH. AND I\'M BAREFOOT IN IT.']),
  },
  TOWER: {
    mh: bp(['THIS IS A CUP NOW.'], ['THIS IS A CUP NOW. I NEED THE SHOWER AFTER.'], ['THIS IS A CUP NOW. BIG ONE. LIKE ME.']),
    satan: ['IT\'S FILLING UP! HELL HAS NO WATER! I CAN\'T SWIM!'], widow: ['GLUB. MY BABY. GLUB. MY JAR.'],
    after: bp(['TWO BUGS UNDER A CUP. CARTOON LAND, BABY.'], ['TWO BUGS UNDER A CUP. NOW I SHOWER.'], ['TWO BUGS UNDER A CUP. NOW WHERE DO I PUT MY PANTS?']),
  },
  NOTHING: {
    mh: bp(['...I\'M JUST GONNA WATCH.'], ['...I\'M JUST GONNA WATCH. AND SIT. CAREFULLY.'], ['...I\'M JUST GONNA WATCH. BREEZY.']),
    satan: ['I\'LL BE BACK... I\'LL BE... ZZZ... *FART*'], widow: ['TELL ZORBLAX... I LEFT THE STOVE ON...'],
    after: bp(['THEY JUST FELL OVER. THAT\'S IT. I WIN.'], ['THEY JUST FELL OVER. ONE SHIT HIMSELF. NOT JUST ME NOW.'], ['THEY JUST FELL OVER. NOW EVERYBODY\'S NAKED. WAIT. NO.']),
  },
};

// ---------------------------------------------------------------------------------------------------------------
// Ben (only with all eight armor pieces given): he says the section's weapon at its start, and grapples one of them

/** Each section's weapon, said straight (his fake riddle after it, short). Keyed by the section's weak key. */
export const BEN_WEAPON: Record<string, string[]> = {
  'SPELLBOOK:split': ['SPELLBOOK. ICE ON THE DEVIL, FIRE ON THE LADY. LIGHTNING ON WHOEVER.', 'BOOK OUT. COLD FOR HORNS, HOT FOR CURLERS. THE BAR DOES NOT LIFT ITSELF.'],
  STUNT_CAR: ['THE CLAPPERBOARD. YELL ACTION. LET THE STUNTMAN EARN IT.', 'CLAPPERBOARD. A CAR TO THE FACE BEATS A SPEECH.'],
  FLINTLOCK: ['THE FLINTLOCK. ONE BALL AT A TIME. AIM FOR THE BIG HEADS.', 'FLINTLOCK. SLOW REPS. HEAVY WEIGHT.'],
  SPELLBOOK: ['THE SPELLBOOK. ANY SPELL. THIS PLACE MAKES THEM WEAK FOR IT.', 'SPELLBOOK. READ TO THEM. HARD.'],
  SPAWNER: ['THE SPAWNER. LET THE GOBLINS CHEW. YOU REST.', 'SPAWNER. NEVER CHEW WHAT A GOBLIN WILL CHEW FOR YOU.'],
  CROSSBOW: ['THE CROSSBOW. STICK THEM TILL THEY STAGGER.', 'CROSSBOW. HIGH REPS, LOW WEIGHT. KEEP STICKING.'],
  SOUVENIR: ['THE SOUVENIR LAUNCHER. HIT THEM WITH THE GIFT SHOP.', 'SOUVENIRS. NOTHING HURTS LIKE A TAJ MAHAL TO THE TEETH.'],
  MALLET: ['THE MALLET. BONK THEM TILL THEY SEE BIRDS.', 'MALLET. A GOOD BONK IS A GOOD REP.'],
  SOUL_SUCKER: ['THE SOUL SUCKER. DRAIN THEM. SPRAY THEM. REPEAT.', 'SOUL SUCKER. NO PAIN, NO DRAIN.'],
};
/** Grabbing one of them (taking it off his hands for a stretch). */
export const BEN_GRAB = ['I GOT THIS ONE. YOU DO YOURS.', 'GO. I\'LL HOLD HER.', 'ONE AT A TIME. THAT\'S HOW YOU LIFT.'];
export const BEN_GRAB_SATAN = ['I GOT THE DEVIL. GO.', 'HORNS ARE HANDLES. GO.'];
/** Shaken off (the stretch over). */
export const BEN_OFF = ['HE BUCKED ME. GIVE ME A SECOND.', 'MY BACK. HANG ON.', 'SHE BIT ME. THAT\'S A FOUL.'];
/** At Meathead's throw (now and then). */
export const BEN_NICE = ['GOOD FORM.', 'HIPS. YOU USED YOUR HIPS. PROUD OF YOU.', 'THAT\'S A PR.'];

// ---------------------------------------------------------------------------------------------------------------
// The Space Needle's fall (the mini-cutscene: Florida from over it, the countdown at the cape, the tip on the rocket,
// the rich guy)

export const NEEDLE_COUNT = ['T-MINUS THREE. TWO.'];
export const MUSK_NAME = 'ELON MUSK';
export const MUSK_RAGE = ['MY ROCKET! THAT WAS GOING TO MARS!', 'WHO DID THAT?! I\'M SUING FLORIDA!', 'THAT WAS MY RIDE OFF THIS PLANET!'];
export const MH_OOPS = bp(['OOPS.'], ['OOPS. SHIT.'], ['OOPS. NAKED OOPS.']);

// ---------------------------------------------------------------------------------------------------------------
// The callbacks (the owner's: "there will be tons of callbacks like 'oh no, we need to shoot someplace else' when you
// destroy the set for the revengers"): the tiny people of a land, as a landmark of it goes, in their own voices from
// the first time through. Only when nobody else is talking; over the tiny speaker only while it's said.

export interface Callback {
  /** Their voice (cast.json: the land's own). */
  voice: string;
  /** Their look, crude (the tiny figure that says it). */
  look: 'suit' | 'staff' | 'guest' | 'cop' | 'costume' | 'robot' | 'alien' | 'cowboy' | 'monster';
  /** Their color (the shirt). */
  col: string;
  lines: ByPants;
}
const cb = (voice: string, look: Callback['look'], col: string, lines: ByPants): Callback => ({ voice, look, col, lines });

export const CALLBACKS: Record<string, Callback[]> = {
  // ---- AMERICA USA (the hub's gate land: on the way in)
  america: [cb('m2.pa', 'staff', '#1D4ED8', same(['ATTENTION GUESTS. AMERICA USA IS CLOSED. AMERICA USA IS FLAT.', 'THANK YOU FOR VISITING AMERICA USA. PLEASE EXIT THROUGH THE CRATER.']))],
  // ---- HOLLYWOOD LAND (done whole)
  blvd: [
    cb('m2.hollywood.elvis', 'costume', '#F8FAFC', bp(['THE KING HAS LEFT THE BUILDING. THE BUILDING HAS LEFT TOO.'], ['THE KING SMELLS SOMETHING, MAN.'], ['THE KING DID NOT NEED TO SEE THAT, MAN.'])),
    cb('m2.hollywood.marilyn', 'costume', '#F9A8D4', bp(['PHOTO, BIG BOY? FORTY BUCKS. YOU\'RE BIGGER NOW.'], ['PHOTO? NO. NOT FOR ANY MONEY.'], ['HAPPY BIRTHDAY, MISTER... OH MY GOD, PUT IT AWAY.'])),
  ],
  chinaish: [cb('m2.hollywood.pa', 'staff', '#B91C1C', same(['IN A WORLD... WHERE THE THEATRE IS FLAT... PARKING IS NOW AVAILABLE.', 'GROWMAN\'S CHINA-ISH THEATRE IS NOW GROWMAN\'S CHINA-ISH HOLE.']))],
  thrones: [
    cb('m2.hollywood.thrones', 'staff', '#7C3AED', same(['THRONES OF THE STARS IS NOT RESPONSIBLE FOR. THAT.', 'PLEASE KEEP YOUR HANDS, FEET AND DEVILS INSIDE THE THRONE.'])),
    cb('m2.hollywood.docent', 'suit', '#A16207', same(['I HAVE A MASTER\'S DEGREE IN THAT TOILET!', 'THE CHAIRMAN OF THE BOWEL! HE DID IT HIS WAY! INTO THE GROUND!'])),
    cb('m2.hollywood.janitor', 'staff', '#0E7490', bp(['I SCRUBBED THOSE WITH A TOOTHBRUSH! FOUR YEARS!'], ['I SCRUBBED THOSE THRONES. I\'M NOT SCRUBBING HIM.'], ['I SCRUB THRONES. I DO NOT SCRUB THAT.'])),
  ],
  warehouse: [
    cb('m2.hollywood.director', 'suit', '#1F2937', same(['OH NO. WE NEED TO SHOOT SOMEPLACE ELSE.', 'CUT! CUT! THAT ROOF COST FOUR HUNDRED GRAND! AGAIN!'])),
    cb('m2.hollywood.ad', 'staff', '#DC2626', same(['KEEP ROLLING. REVENGERS 21 IS ALL CGI ANYWAY.', 'CODE RED! THE SET IS LOOSE! THE SET IS EVERYWHERE!'])),
    cb('m2.hollywood.grip', 'staff', '#78350F', same(['THOSE WALLS WERE UNION BUILT, ASSHOLE!', 'THE NEW WALLS! WE JUST PUT UP THE NEW WALLS!'])),
  ],
  backlot: [
    cb('m2.hollywood.extra', 'guest', '#9CA3AF', bp(['I\'M BACKGROUND! I DON\'T HAVE LINES! THIS IS A LINE! A GOOD ONE!'], ['I\'M BACKGROUND! WHY DOES THE BACKGROUND SMELL?!'], ['I\'M BACKGROUND! HIS BALLS ARE IN THE FOREGROUND!'])),
    cb('m2.hollywood.guide', 'staff', '#059669', bp(['SIR! THE BACKLOT IS TRAM ONLY! I WILL WRITE YOU A BIG TICKET!'], ['SIR! THE BACKLOT HAS A SMELL POLICY!'], ['SIR! THE BACKLOT HAS A PANTS POLICY!'])),
  ],
  hwtower: [cb('m2.hollywood.security', 'cop', '#1E3A8A', bp(['STOP RIGHT THERE! I HAVE A GOLF CART! IT\'S UNDER YOUR FOOT!'], ['STOP! I HAVE A GOLF CART! AND A GAS MASK!'], ['STOP! I HAVE A GOLF CART! AND A BLINDFOLD!']))],
  disaster: [
    cb('m2.hollywood.disaster', 'staff', '#57534E', same(['HERE\'S A GIANT. THAT\'S NEW.', 'THANK YOU FOR RIDING DISASTER: THE RIDE. THE RIDE IS THE DISASTER NOW.'])),
    cb('m2.hollywood.tech', 'staff', '#CA8A04', same(['THAT FAN WAS ON MY TIMESHEET!', 'NOBODY TOLD ME THE TORNADO WAS REAL THIS TIME!'])),
  ],
  hwsign: [cb('m2.hollywood.looter', 'guest', '#65A30D', same(['IT\'S THE APOCALYPSE! THE LETTERS ARE FREE!', 'I GOT THE DOUBLE O! I GOT THE DOUBLE O!']))],
  stunt: [
    cb('m2.hollywood.pa', 'staff', '#B91C1C', same(['STUNTMAN STEVE\'S STUPENDOUS STUNTERY IS CANCELED. AGAIN. HARDER.', 'AND THAT WAS THE STADIUM, FOLKS. IT MISSED THE MAT. NO REFUNDS.'])),
    cb('m2.hollywood.stuntco', 'staff', '#EA580C', same(['STEVE WOULD HAVE WANTED THIS. HE\'D HAVE WANTED TO BE THROWN IN IT.', 'NOBODY SHOWS UP STEVE! EXCEPT EVERYBODY, APPARENTLY!'])),
  ],
  // ---- FAIRY LAND (placeholders: a line each, more to come)
  hogsmeat: [cb('m2.fantasy.troll', 'monster', '#4D7C0F', bp(['TROLL TOLL! YOU OWE ME A WHOLE TOWN!'], ['TROLL TOLL! AND A CLEANING FEE!'], ['TROLL TOLL! AND PUT SOMETHING ON!']))],
  fairywheel: [cb('m2.fantasy.suitor_chad', 'guest', '#2563EB', same(['PIPER\'S GONNA LOVE THESE GUNS, BRO. OH. THE WHEEL\'S GONE, BRO.']))],
  pixiecastle: [cb('m2.fantasy.courtier', 'suit', '#9D174D', same(['HOW DARE YOU! THE GREAT PIXIE IS DEAD! SHE WAS RESTING!']))],
  // ---- JUNGLE LAND
  cruise: [cb('m2.operator', 'staff', '#15803D', same(['THEY DON\'T PAY ME ENOUGH TO STOP THAT.']))],
  temple: [cb('m2.guest', 'guest', '#F59E0B', same(['OH MY GOD! THE TEMPLE! ...SO IS THE WAIT GONNA BE LONGER?', 'THEY JUST FIXED THAT ROOF!']))],
  kabooma: [cb('m2.maint', 'staff', '#CA8A04', same(['TWELVE YEARS IN THIS BOOTH. NOTHING EVER HAPPENED. UNTIL NOW.']))],
  // ---- FOREIGN LANDS
  pavilions: [cb('m2.foreign.pa', 'staff', '#0EA5E9', same(['TEN COUNTRIES. ZERO FOREIGNERS. ZERO COUNTRIES.']))],
  monuments: [cb('m2.foreign.mech_moai', 'robot', '#78716C', same(['...OW.'])), cb('m2.foreign.mech_eiffel', 'robot', '#8A6A4A', same(['MY ELEVATOR WAS ALREADY BROKEN. NOW THIS.']))],
  libertydig: [cb('m2.foreign.pa', 'staff', '#0EA5E9', same(['AMERICA: COMING SOON. AMERICA: CANCELED.']))],
  // ---- FUTURE LAND
  atom: [cb('m2.space.op', 'staff', '#14B8A6', same(['WELCOME TO THE FUTURE! HOW MANY IN YOUR... NEVER MIND.']))],
  needle: [cb('m2.space.needle', 'staff', '#E5E7EB', same(['SPACE NEEDLE TWO IS NOW HORIZONTAL. THE TRIP TO FLORIDA TAKES NINE SECONDS.']))],
  // ---- WILDERNESS LAND
  gulch: [cb('m2.frontier.sheriff', 'cowboy', '#92400E', same(['FOUR HUNDRED SHOWS. NOBODY EVER STEPPED ON THE TOWN.']))],
  traincrash: [cb('m2.frontier.townsman', 'cowboy', '#92400E', same(['THE TRAIN AGAIN?! WE JUST SWEPT UP THE LAST ONE!']))],
  timber: [cb('m2.frontier.announcer', 'cowboy', '#B45309', same(['HOLD ON TO YOUR HATS! THERE GOES TIMBER TUMBLE!']))],
  // ---- SPOOKY LAND
  dracula: [cb('m2.donnie.pa', 'monster', '#581C87', same(['GOOD EVENINK. THE CASTLE IS CLOSED. ALSO FLAT. ALSO I AM DEAD.']))],
  hellevator: [cb('m2.hellop', 'staff', '#7F1D1D', same(['NO WRISTBAND, NO HELL. YOU KNOW WHAT? GO AHEAD.']))],
  // ---- CARTOON LAND
  cwtower: [cb('m2.cartoon.guide', 'staff', '#DB2777', same(["HI! WELCOME! HE'S PULLING UP THE WATER TOWER! THAT'S LOAD BEARING! I WANT TO DIE!"]))],
  amphi: [cb('m2.cartoon.bouncer', 'cop', '#111827', bp(['SHOW\'S IN PROGRESS. NO GIANTS ON STAGE.'], ['SHOW\'S OVER. AND IT SMELLS.'], ['SHOW\'S OVER. PUT IT AWAY.']))],
};

// ---------------------------------------------------------------------------------------------------------------
// Hurt and death (his hurt callouts; the death screen's one line, 28 characters at most)

export const HURT: Record<string, { hurt: string[]; death: string[] }> = {
  'm2:fin_fire': { hurt: ['HOT! THAT\'S MY GOOD SIDE!', 'FIRE BREATH! BRUSH YOUR TEETH!'], death: ['FLAMBEED BY SATAN', 'DEVIL BREATH'] },
  'm2:fin_slam': { hurt: ['HE LANDED ON ME!', 'GET YOUR HOOVES OFF ME!'], death: ['STOMPED BY SATAN', 'HOOFED'] },
  'm2:fin_claw': { hurt: ['CLAWS! CUT YOUR NAILS!', 'HE SCRATCHED MY NIPPLE!'], death: ['CLAWED BY SATAN'] },
  'm2:fin_laser': { hurt: ['HER EYE SHOOTS LASERS NOW?!', 'MY PANTS! THE LASER!'], death: ['LASERED BY A WIDOW', 'SHOT BY THE ONE EYE'] },
  'm2:fin_hop': { hurt: ['SHE SAT ON ME!', 'GET YOUR HOUSECOAT OFF MY FACE!'], death: ['SAT ON BY A WIDOW', 'CRUSHED BY CURLERS'] },
  'm2:fin_butt': { hurt: ['A CIGARETTE BUTT! THE SIZE OF A LOG!', 'SHE FLICKED HER BUTT AT ME!'], death: ['KILLED BY A CIGARETTE BUTT'] },
  'm2:fin_minion': { hurt: ['A TINY ONE BIT MY TOE!', 'GET OFF MY SHIN, YOU MICE!'], death: ['NIBBLED TO DEATH'] },
  'm2:fin_ufo': { hurt: ['THE TINY SAUCERS ARE SHOOTING!', 'GET YOUR DINNER PLATES OUT OF MY FACE!'], death: ['SHOT DOWN BY SAUCERS'] },
};

// ---------------------------------------------------------------------------------------------------------------

const flat = (...pools: (string[] | ByPants)[]) => pools.flatMap(p => (Array.isArray(p) ? p : [...p.clean, ...p.shitty, ...p.nude]));
const cbVoices = (): Record<string, string[]> => {
  const out: Record<string, string[]> = {};
  for (const list of Object.values(CALLBACKS)) for (const c of list) (out[c.voice] ??= []).push(...flat(c.lines));
  return out;
};
export const FINALE_VOICE_LINES: Record<string, string[]> = {
  meathead: flat(MH_ARRIVE, MH_KIDS, MH_RAY, MH_BEN_RAY, MH_GIANT, MH_AMERICA, ...Object.values(MH_LAND), MH_WEAK, MH_STUNNED, MH_THROW, MH_NEXT, MH_STOMP, MH_HALF, MH_END, MH_OOPS, ...Object.values(FINISH).flatMap(f => [f.mh, f.after]), ...Object.values(HURT).map(h => h.hurt)),
  death: flat(...Object.values(HURT).map(h => h.death)),
  [SATAN_VOICE]: flat(SATAN_CLAIM, SATAN_BACK, SATAN_SEE, SATAN_GRIEF, SATAN_TRUCE, SATAN_IMPRESSED, SATAN_GO, SATAN_TAUNT, SATAN_HURT, SATAN_DAZED, SATAN_THROWN, SATAN_UP, SATAN_HELD, SATAN_NECK, SATAN_RAGE, SATAN_DAZE, ...Object.values(FINISH).map(f => f.satan)),
  [WIDOW_VOICE]: flat(WIDOW_CLAIM, WIDOW_SEE, WIDOW_GRIEF, WIDOW_TRUCE, WIDOW_EMBIGGEN, WIDOW_GO, WIDOW_TAUNT, WIDOW_HURT, WIDOW_DAZED, WIDOW_THROWN, WIDOW_UP, WIDOW_HELD, WIDOW_NECK, WIDOW_RAGE, WIDOW_DAZE, ...Object.values(FINISH).map(f => f.widow)),
  [CREW_VOICE]: flat(CREW_EMBIGGEN),
  [BEN_VOICE]: flat(BEN_RAY, ...Object.values(BEN_WEAPON), BEN_GRAB, BEN_GRAB_SATAN, BEN_OFF, BEN_NICE),
  [MUSK_VOICE]: flat(MUSK_RAGE),
  'm2.space.needle': flat(NEEDLE_COUNT),
};
for (const [v, l] of Object.entries(cbVoices())) (FINALE_VOICE_LINES[v] ??= []).push(...l);
