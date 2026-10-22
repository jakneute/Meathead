// What's said outside the great pixie's bedroom and in PIPER THE PIXIE's fight, by voice (fantasy/voices.ts gathers
// it; tools/voices records it). In the user's voice: blunt, short, vulgar, specific; talk less; fit the trigger. Picked
// with pickLine (never twice in 45 s). Clean / shitty / naked pools for every group, his and hers, intro to death (the
// naked ones play up the boner: hard in the hall, dead at the sight of her, hopeful at the supermodel, dead again).
//
// Her LUST was for men killing each other for her; now one's at her door insulting her, and it's soured into rage.
// The elemental shouts lead with the user's words ("FIRE BALL!", "ICE BALL!", "LIGHTNING BOLT!"). Every Piper line here
// goes through piperLines.ts (never twice in one life). Pure data.

import { allOf, PIPER_VOICE, type ByPants, type HurtTable } from '../talk';

export { PIPER_VOICE };

// ---------------------------------------------------------------------------------------------------------------
// The hall and the door

/** In off the glass, outside her door (the first time this visit). */
export const MH_HALL: ByPants = {
  clean: ["HER BEDROOM DOOR. I SHOULD'VE BROUGHT A CONDOM. OR SIX.", 'A PILE OF DEAD SUITORS AND A DOOR. KNOCK KNOCK.'],
  shitty: ['SHE\'S BEHIND THAT DOOR. MY SHIT\'S BEHIND ME.', 'NO TIME TO CHANGE. SOME GIRLS ARE INTO THIS.'],
  nude: ['ALREADY NAKED. SAVES ME THE AWKWARD BELT PART.', 'THE BONER FOUND THE BEDROOM BEFORE I DID.'],
};
/** The boot going into her door. */
export const MH_KICK: ByPants = {
  clean: ['ROOM SERVICE!', "HONEY, I'M HOME! TAKE YOUR PANTS OFF!"],
  shitty: ['SPECIAL DELIVERY! IT\'S IN MY PANTS!', 'OPEN UP! I SHIT MYSELF FOR YOU!'],
  nude: ['ROOM SERVICE! IT\'S HARD!', 'KNOCK KNOCK! WHO\'S THERE? MY DICK!'],
};
/** Her, on her chaise, the door flat on her carpet: still purring (she can't see him yet for the dust). */
export const PIPER_REVEAL: ByPants = {
  clean: ['MMM. THE LAST ONE STANDING. COME TO MOMMA.', "YOU KILLED THEM ALL. I'M SO WET I SLID OFF THE CHAISE."],
  shitty: ['YOU WADED THROUGH BLOOD AND SHIT FOR ME. I CAN SMELL IT.', 'MMM. A MAN WHO SOILS HIMSELF FOR ME.'],
  nude: ['NAKED ALREADY? THE BLOOD GOT YOU GOING TOO?', 'OOH. YOU ALREADY TOOK OFF YOUR PANTS. EAGER.'],
};
/** The dust settles: him seeing her. (Naked: as the boner goes down.) */
export const MH_SEES: ByPants = {
  clean: ['OH NO. OH GOD NO.', 'THAT\'S PIPER? THAT\'S A WHOLE PIPELINE.'],
  shitty: ['I JUST SHIT MYSELF AGAIN. LOOKING AT YOU.', 'OH GOD. MORE CAME OUT. FROM FEAR.'],
  nude: ['IT\'S GOING DOWN. IT\'S GOING DOWN FAST.', 'IT JUST CRAWLED BACK UP INSIDE ME.'],
};
/** The insult: how fat she is. */
export const MH_FAT: ByPants = {
  clean: ['YOU\'RE NOT A PIXIE. YOU ATE THE PIXIE.', 'I KILLED A DOZEN GUYS FOR A WATER HEATER IN A DRESS.', 'THOSE WINGS COULDN\'T LIFT ONE OF YOUR CHINS.'],
  shitty: ['I SHIT MY PANTS AND I\'M STILL NOT THE GROSSEST THING IN HERE.', 'MY PANTS ARE HAULING LESS LOAD THAN THAT DRESS.'],
  nude: ['MY DICK TOOK ONE LOOK AT YOU AND WENT BACK INSIDE.', "YOU KILLED MY BONER. THAT'S FIRST DEGREE MURDER."],
};
/** ...and how ugly. */
export const MH_UGLY: ByPants = {
  clean: ['AND THAT FACE. YOUR VOICE WROTE A CHECK YOUR FACE CAN\'T CASH.', 'YOU SOUND LIKE A TEN. YOU LOOK LIKE TEN OF YOU.'],
  shitty: ['YOU\'RE UGLIER THAN WHAT\'S IN MY PANTS.', "I'D RATHER FUCK MY OWN SHITTY PANTS."],
  nude: ['I\'M NAKED AND YOU\'RE THE ONE WHO SHOULD COVER UP.', 'PUT SOME CLOTHES ON. A TARP. A CIRCUS TENT.'],
};
/** Insulted: the lust gone sour. She wanted men to die for her, not this. */
export const PIPER_ENRAGED: ByPants = {
  clean: ['FAT?! MEN DIED FOR THIS! DOZENS OF THEM!', "THEY DIED FOR ME! YOU DON'T GET TO CALL ME FAT!"],
  shitty: ['A MAN IN SHITTY PANTS DOES NOT CALL ME UGLY!', "YOU SMELL LIKE A TRUCK STOP TOILET AND I'M UGLY?!"],
  nude: ['YOUR LITTLE LIMP DICK DOESN\'T GET A VOTE!', 'I\'VE SEEN BIGGER ON A PIXIE! AND I EAT PIXIES!'],
};
/** ...and on. */
export const PIPER_FIGHT: ByPants = {
  clean: ['NOW YOU DIE FOR ME TOO!', "I'LL BLEED YOU MYSELF, YOU LITTLE PRICK!"],
  shitty: ['I\'LL SQUASH THE SHIT RIGHT OUT OF YOU!', 'YOU\'LL DIE IN THOSE PANTS!'],
  nude: ['I\'LL SIT ON YOU TILL IT FALLS OFF!', "I'M GOING TO FLATTEN THAT LITTLE THING LIKE A PENNY!"],
};
/** His answer, and it's on. */
export const MH_ON: ByPants = {
  clean: ['COME ON THEN, LARD WINGS.', 'BRING IT, MOUNT FAT-MORE.'],
  shitty: ['I\'M ALREADY SHITTING. YOU CAN\'T SCARE ME.', 'COME ON. MY PANTS HAVE NOTHING LEFT TO LOSE.'],
  nude: ['COME ON. IT CAN\'T GET ANY SMALLER.', 'NAKED, LIMP, AND PISSED OFF.'],
};
/** A retry (the door already down): her, waiting for him. */
export const PIPER_AGAIN: ByPants = {
  clean: ['BACK FOR SECONDS? I ALWAYS GO BACK FOR SECONDS.', 'YOU AGAIN. CALL ME FAT AGAIN. I DARE YOU.'],
  shitty: ['THE SHITTY ONE\'S BACK. OPEN A WINDOW.', 'YOU DIED AND YOU STILL SMELL. HOW?'],
  nude: ['BACK AGAIN, NAKED? STILL LIMP?', 'THE LITTLE DICK RETURNS. SEQUEL NOBODY WANTED.'],
};
export const MH_AGAIN: ByPants = {
  clean: ['ROUND TWO, FATSO.', "I'M BACK. YOU GOT FATTER. HOW?"],
  shitty: ['BACK. STILL SHITTY. STILL PRETTIER THAN YOU.', 'I SHIT MYSELF DYING. THANKS FOR THAT.'],
  nude: ['BACK. STILL NAKED. STILL SOFT AS A CHURRO.', 'LET\'S GO. IT\'S NOT COMING BACK UP.'],
};

// ---------------------------------------------------------------------------------------------------------------
// The fight

/** Her, now and then (when nobody's talking). */
export const PIPER_TAUNT: ByPants = {
  clean: ['THEY ALL DIED PRETTY FOR ME. YOU\'LL DIE UGLY.', 'SAY FAT AGAIN. I DARE YOU, YOU LITTLE TURD.', 'I WAS GOING TO WATCH YOU DIE. NOW I\'LL DO IT.'],
  shitty: ['STAND STILL, SHIT PANTS.', 'I CAN SMELL WHERE YOU\'RE HIDING.', 'EVEN THE SUITORS DIED CLEANER THAN YOU.'],
  nude: ['PUT THAT LITTLE THING AWAY AND DIE.', 'I NEED READING GLASSES FOR THAT THING.', 'COME HERE, SHRIMP. LET MOMMA FLATTEN YOU.'],
};
/** Up she goes: the leap (a shout as she crouches). */
export const PIPER_LEAP: ByPants = {
  clean: ['BELLY FLOP!', 'HERE COMES MOMMA!', 'INCOMING ASS!'],
  shitty: ['SQUISH THE SHIT OUT OF YOU!', 'CANNONBALL!', 'HERE COMES MOMMA!'],
  nude: ['SIT ON IT!', 'BELLY FLOP!', 'FLATTEN THE SHRIMP!'],
};
/** Hit (a bark, now and then). */
export const PIPER_HURT: ByPants = {
  clean: ['OW! MY FIGURE!', "NOT THE DRESS! IT'S A SIXTY!", 'YOU FUCKING BRUTE!'],
  shitty: ['DON\'T TOUCH ME WITH THOSE HANDS!', "EW! YOUR SHIT'S ON MY DRESS!"],
  nude: ['DON\'T RUB THAT ON ME!', "DON'T POKE ME WITH IT! IT'S TOO SMALL TO POKE!"],
};
/** A hole in her (the flintlock): the leak, and off she goes round the room. */
export const PIPER_HOLE: ByPants = {
  clean: ['I\'M LEAKING! PLUG IT!', 'MY CURVES! THEY\'RE GETTING AWAY!', 'WHEEEE! NO! NOT WHEEEE!'],
  shitty: ['NOW WE\'RE BOTH LEAKING!', 'IT\'S COMING OUT OF ME! LIKE YOU!'],
  nude: ['I\'M DEFLATING! LIKE YOUR DICK!', 'PLUG IT! NOT WITH THAT!'],
};
/** Low (a third left). */
export const PIPER_LOW: ByPants = {
  clean: ['THIS IS NOT HOW THE AUDIENCE GOES!', 'NOBODY WAS SUPPOSED TO SURVIVE! THAT WAS THE POINT!'],
  shitty: ['I WILL NOT DIE TO A MAN WHO SMELLS LIKE THAT!', 'NOT LIKE THIS! NOT TO SHITTY PANTS!'],
  nude: ['I WILL NOT DIE TO A LIMP NAKED MAN!', 'NOT TO A NAKED NOBODY WITH A BABY CARROT!'],
};
/** The elemental throws: the user's shouts first, as they are, then variants (she never says one twice in a life; with
 *  a pool used up, she throws without a word). */
export const ELEMENT_SHOUT = {
  fire: ['FIRE BALL!', 'EAT FIRE!', 'BURN, SHRIMP!', 'HOT ONE, BABY!', 'FIRE! OPEN WIDE!', 'ROAST, LITTLE MAN!', 'FIRE IN THE HOLE!', 'COOK FOR MOMMA!'],
  ice: ['ICE BALL!', 'FREEZE, SHRIMP!', 'CHILL OUT!', 'ICE COLD, BABY!', 'FREEZE FOR MOMMA!', 'ICE! HOLD STILL!', 'HAVE AN ICE BALL!', 'COLD ONE COMING!'],
  shock: ['LIGHTNING BOLT!', 'ZAP!', 'FRY, SHRIMP!', 'LIGHT HIM UP!', 'FEEL THE BUZZ!', 'LIGHTNING, BABY!', 'SHOCKING, ISN\'T IT?', 'BOLT FOR MOMMA!'],
} as const;

/** Him, now and then. */
export const MH_TAUNT: ByPants = {
  clean: ['YOU\'RE BREAKING YOUR OWN HOUSE, LARD WINGS.', 'THOSE WINGS ARE DECORATIVE. NO WAY THEY LIFT THAT.', 'EVERY TIME YOU JUMP, SOMEWHERE A FLOOR JOIST CRIES.'],
  shitty: ['EVERY TIME YOU LAND, MORE COMES OUT OF ME.', 'STOP JUMPING. I\'M RUNNING OUT OF PANTS.'],
  nude: ['EVERYTHING\'S SWINGING. NONE OF IT FOR YOU.', 'EVERY TIME YOU LAND MY DICK RETREATS AN INCH.'],
};
/** Him thinking out loud about the flintlock (only if he's got it): he's hitting her with anything else. */
export const MH_HINT: ByPants = {
  clean: ['SHE\'S BASICALLY A BALLOON. I\'VE GOT A GUN THAT MAKES HOLES.', "ONE BALL FROM THE FLINTLOCK AND SHE'LL GO LIKE A WHOOPEE CUSHION."],
  shitty: ['I SHOULD PUT A HOLE IN HER. THE FLINTLOCK.', 'SHE\'S FULL OF SOMETHING. LET IT OUT. FLINTLOCK.'],
  nude: ['SHE NEEDS A PRICK. THE FLINTLOCK. NOT MINE.', 'BLOW A HOLE IN HER. THE OLD PISTOL. NOT THE OTHER ONE.'],
};
/** He's put a hole in her. */
export const MH_HOLE: ByPants = {
  clean: ['LOOK AT HER GO!', "SHE'S A FART IN A BALLOON!", "THAT'S NOT BLOOD. THAT'S GRAVY. BROWN GRAVY."],
  shitty: ['NOW SHE KNOWS HOW I FEEL!', 'SHE\'S LEAKING WORSE THAN ME!'],
  nude: ['NOW SHE\'S DEFLATING TOO!', 'SHE\'S GOING DOWN FASTER THAN MY DICK DID!'],
};
/** The room coming apart: what's loose now (his first look at each). */
export const MH_LOOSE: Record<'heat' | 'nitro' | 'wires', ByPants> = {
  heat: {
    clean: ['A STEAM PIPE. NOW IT\'S A FLAMETHROWER.', 'SHE BROKE THE HEAT MAIN. A PIXIE WITH A GAS BILL.'],
    shitty: ['A FIRE PIPE. MY PANTS ARE FLAMMABLE NOW.', "DON'T STAND BY THE FIRE. SHIT'S A FUEL. ASK ANY FARMER."],
    nude: ['FIRE PIPE. NOTHING BETWEEN IT AND MY BALLS.', 'NAKED NEAR AN OPEN FLAME. MY PUBES ARE KINDLING.'],
  },
  nitro: {
    clean: ['LIQUID NITROGEN. THE PARK\'S ICE EFFECTS.', 'THAT STUFF FREEZES YOU SOLID. SAW IT ON YOUTUBE.'],
    shitty: ['FROZEN SHIT. THAT\'S A NEW ONE.', 'IF THAT HITS ME, IT\'S A SHITSICLE.'],
    nude: ['LIQUID NITROGEN. AND I\'M NAKED. GREAT.', 'IF THAT HITS MY BALLS THEY\'RE GONE.'],
  },
  wires: {
    clean: ['LIVE WIRES IN THE WATER. STAY OUT OF THE PUDDLE.', 'SHE FLOODED THE ROOM AND DROPPED THE WIRES IN.'],
    shitty: ['WATER AND WIRES. AND MY PANTS ARE ALREADY WET.', "DON'T STEP IN THE SPARKY PUDDLE. FIRST RULE OF LIFE."],
    nude: ["NAKED AND WET. THAT'S HOW YOU BECOME A HOT DOG.", 'KEEP MY BALLS OUT OF THAT PUDDLE.'],
  },
};
/** Frozen solid: the mash. */
export const MH_FROZEN: ByPants = {
  clean: ['C-C-COLD!', "MY ASSHOLE'S FROZEN SHUT!"],
  shitty: ['IT FROZE IN MY PANTS!', 'SHITSICLE!'],
  nude: ['MY BALLS! THEY\'RE INSIDE ME!', 'SHRINKAGE! SHRINKAGE!'],
};

// ---------------------------------------------------------------------------------------------------------------
// Her deaths

/** Beaten (any way but the flintlock): one last belly flop, at him. */
export const PIPER_LAST: ByPants = {
  clean: ['ONE LAST BELLY FLOP!', "IF I GO, I'M TAKING THE FLOOR!"],
  shitty: ['ONE MORE! RIGHT ON YOUR SHITTY HEAD!', "I'LL SIT ON YOU TILL YOU POP LIKE A PIMPLE!"],
  nude: ['ONE MORE! RIGHT ON YOUR LITTLE DICK!', 'I\'LL FLATTEN THAT THING FOR GOOD!'],
};
/** THE CORK (her usual death): wedged in the floor to the waist. */
export const PIPER_STUCK: ByPants = {
  clean: ['I\'M STUCK! DON\'T YOU DARE LOOK AT ME!', 'GET ME OUT! MY LEGS ARE IN THE GIFT SHOP!'],
  shitty: ['I\'M STUCK! AND IT SMELLS UP HERE!', 'PULL ME OUT! NOT WITH THOSE SHIT HANDS!'],
  nude: ['DON\'T COME NEAR ME WITH THAT THING!', 'I\'M STUCK! KEEP YOUR LITTLE DICK AWAY!'],
};
/** The pressure under her. */
export const MH_PRESSURE: ByPants = {
  clean: ["SHE'S A TURD IN THE PLUMBING. A BIG ONE.", 'SHE\'S A CORK. SHE\'S A CORK IN THE PLUMBING.'],
  shitty: ['THAT\'S A LOT OF PRESSURE. I KNOW THE FEELING.', "SOMETHING'S BUILDING UP. I KNOW THAT GURGLE."],
  nude: ["SOMETHING'S ABOUT TO BLOW. NOT ME. NOT TODAY.", 'SHE\'S PLUGGING THE PIPES. STAND BACK.'],
};
/** Popped out like a champagne cork, up through the roof (the scream). */
export const PIPER_POP = ['NOOOOOOOOOO!', 'WHY DID I BUILD A TALL CASTLE!'];
/** After the distant thud. */
export const MH_WON: ByPants = {
  clean: ['AUDIENCE OVER. NO SEX. TYPICAL.', 'THAT\'S WHAT YOU GET FOR SOUNDING HOT.', 'POP GOES THE PIGGY.'],
  shitty: ['SHE SHAT ON THE WAY UP. NOW WE\'RE EVEN.', 'NOBODY CALLS ME UGLY AND SHITTY AND LIVES.'],
  nude: ['I CAME. I SAW. IT WENT LIMP.', 'I CAME FOR PUSSY AND GOT A WHALE SHOW.'],
};

/** THE DEFLATED BALLOON (the weakness): leaking down to a supermodel... */
export const PIPER_SUPERMODEL: ByPants = {
  clean: ['OH MY GOD. I\'M GORGEOUS.', "LOOK AT ME. I'M A TEN. FUCK ALL OF YOU."],
  shitty: ['LOOK AT ME! EVEN YOU STINK LESS NOW!', 'I\'M GORGEOUS! TOO GOOD FOR YOU, SHIT PANTS!'],
  nude: ['OH, NOW IT WAKES UP? TYPICAL MAN.', 'LOOK WHO\'S STANDING UP NOW.'],
};
export const MH_SUPERMODEL: ByPants = {
  clean: ['WAIT. WAIT WAIT WAIT.', 'OKAY. HOLD ON. I TAKE BACK EVERY FAT THING.'],
  shitty: ['HOLD ON. LET ME CHANGE MY PANTS.', 'WAIT. I HAVE WET WIPES. SOMEWHERE.'],
  nude: ['HELLO AGAIN, OLD FRIEND.', 'IT\'S ALIVE. IT\'S ALIVE!'],
};
/** ...and past it. */
export const PIPER_TOO_THIN: ByPants = {
  clean: ['WAIT. TOO MUCH. PLUG IT. PLUG ME.', 'I CAN SEE MY OWN SPINE.'],
  shitty: ['STOP! I CAN\'T EVEN SMELL YOU ANYMORE!', "STOP! I'M A SIZE ZERO! THAT'S NOT A REAL SIZE!"],
  nude: ['IT\'S GOING DOWN AGAIN, ISN\'T IT.', 'DON\'T LOOK AT ME LIKE THAT. AGAIN.'],
};
export const MH_TOO_THIN: ByPants = {
  clean: ['NOPE. TOO FAR. WAY TOO FAR.', 'EAT A SANDWICH. EAT A SUBWAY.'],
  shitty: ['NOW YOU NEED THE FOOD MORE THAN I NEED THE PANTS.', "SHE'S A COAT RACK WITH TITS."],
  nude: ['AND IT\'S GONE AGAIN.', 'DOWN AGAIN. MY DICK HAS WHIPLASH.'],
};
/** The last thing she says before she crumbles. */
export const PIPER_CRUMBLE = ['WORTH... IT...', 'AT LEAST... I DIED THIN...'];
export const MH_WON_WEAK: ByPants = {
  clean: ['SHE WENT FROM TOO MUCH TO NOTHING.', 'POPPED. LIKE A BALLOON AT A FUNERAL.'],
  shitty: ['SHE LEAKED OUT WORSE THAN ME. RESPECT.', 'THAT\'S A LOT OF GRAVY ON THE FLOOR.'],
  nude: ['FOR ONE SECOND THERE, I HAD A SHOT.', 'GOODBYE, SUPERMODEL. GOODBYE, BONER.'],
};

/** A grab at her: too much of her. */
export const GRAB_PIPER = ['I CAN\'T GET MY ARMS AROUND HER!', 'WHERE DOES SHE END? WHERE DOES SHE END!', 'IT\'S LIKE HUGGING A WATERBED!'];

// ---------------------------------------------------------------------------------------------------------------
// What hurts him in here, and the death screens (28 characters at most)

export const SRC = {
  heat: 'm2:fa_pp_heat', nitro: 'm2:fa_pp_nitro', shock: 'm2:fa_pp_shock',
  fireball: 'm2:fa_pp_fireball', iceball: 'm2:fa_pp_iceball', bolt: 'm2:fa_pp_bolt',
  debris: 'm2:fa_pp_debris', chandelier: 'm2:fa_pp_chandelier', slam: 'm2:fa_pp_slam', bounce: 'm2:fa_pp_bounce', body: 'm2:fa_pp_body',
} as const;
export const HURT: HurtTable = {
  [SRC.heat]: { hurt: ['THE PIPE! IT\'S ON FIRE!', 'MY ASS! IT\'S COOKING!', 'MY TAINT IS SIZZLING!'], death: ['ROASTED BY THE PLUMBING', 'COOKED BY A HEAT MAIN'] },
  [SRC.nitro]: { hurt: ['COLD! IT BURNS COLD!', 'LIQUID NITROGEN! MY LEGS!', 'MY NIPPLES COULD CUT GLASS!'], death: ['FLASH FROZEN', 'A MEATHEAD POPSICLE'] },
  [SRC.shock]: { hurt: ['THE PUDDLE\'S LIVE!', 'ZAPPED! THROUGH MY FEET!', 'MY FILLINGS!'], death: ['ELECTROCUTED IN A PUDDLE', 'FRIED IN HER BEDROOM'] },
  [SRC.fireball]: { hurt: ['FIRE BALL! IN THE FACE!', 'SHE THREW A FIREBALL LIKE A SOFTBALL MOM!', 'MY HAIR!'], death: ['HIT BY A FAT FIRE BALL', 'FIREBALLED BY A PIXIE'] },
  [SRC.iceball]: { hurt: ['ICE BALL! I\'M STUCK!', 'SHE FROZE ME!', 'MY BALLS ARE ICE CUBES!'], death: ['ICE BALLED TO DEATH', 'FROZEN BY A PIXIE'] },
  [SRC.bolt]: { hurt: ['LIGHTNING! INDOORS!', "MY ASSHOLE'S HUMMING!", 'ZAPPED! BY A PIXIE!'], death: ['STRUCK BY A FAT PIXIE', 'LIGHTNING BOLTED'] },
  [SRC.debris]: { hurt: ['THE CEILING!', 'HER WHOLE HOUSE IS SHITTING ON ME!', 'HER HOUSE IS FALLING ON ME!'], death: ['BURIED UNDER HER CEILING', 'CRUSHED BY PLASTER'] },
  [SRC.chandelier]: { hurt: ['THE CHANDELIER!', 'CRYSTALS! EVERYWHERE!', 'A WHOLE LIGHT FIXTURE! FROM POTTERY BARN!'], death: ['CRUSHED BY A CHANDELIER', 'CHANDELIERED'] },
  [SRC.slam]: { hurt: ['SHE LANDED ON ME!', 'BELLY FLOPPED!', 'I CAN\'T BREATHE! SHE\'S ON ME!'], death: ['SAT ON BY A PIXIE', 'FLATTENED BY A BELLY FLOP'] },
  [SRC.bounce]: { hurt: ['SHE BOUNCED INTO ME!', 'A FLYING FAT LADY! FULL OF GRAVY!', 'GRAVY! ALL OVER ME!'], death: ['HIT BY A LEAKING PIXIE', 'BOUNCED TO DEATH'] },
  [SRC.body]: { hurt: ['HER BELLY! LIKE A TRUCK!', 'BUMPED BY HER GUT!', 'HER GUT HIT ME LIKE A MINIVAN!'], death: ['BELLY BUMPED TO DEATH', 'DIED IN HER ROLLS'] },
};
/** How each kills him (deathAnim.ts: registerDeathKind). */
export const DEATH_KIND = {
  [SRC.heat]: 'burnt', [SRC.fireball]: 'burnt', [SRC.nitro]: 'frozen', [SRC.iceball]: 'frozen', [SRC.shock]: 'fried', [SRC.bolt]: 'fried',
  [SRC.debris]: 'flattened', [SRC.chandelier]: 'flattened', [SRC.slam]: 'flattened',
} as const;

export const VOICE_LINES: Record<string, string[]> = {
  meathead: [
    ...[MH_HALL, MH_KICK, MH_SEES, MH_FAT, MH_UGLY, MH_ON, MH_AGAIN, MH_TAUNT, MH_HINT, MH_HOLE, ...Object.values(MH_LOOSE), MH_FROZEN,
      MH_PRESSURE, MH_WON, MH_SUPERMODEL, MH_TOO_THIN, MH_WON_WEAK].flatMap(allOf),
    ...GRAB_PIPER, ...Object.values(HURT).flatMap(h => h.hurt),
  ],
  death: Object.values(HURT).flatMap(h => h.death),
  [PIPER_VOICE]: [
    ...[PIPER_REVEAL, PIPER_ENRAGED, PIPER_FIGHT, PIPER_AGAIN, PIPER_TAUNT, PIPER_LEAP, PIPER_HURT, PIPER_HOLE, PIPER_LOW, PIPER_LAST, PIPER_STUCK,
      PIPER_SUPERMODEL, PIPER_TOO_THIN].flatMap(allOf),
    ...ELEMENT_SHOUT.fire, ...ELEMENT_SHOUT.ice, ...ELEMENT_SHOUT.shock, ...PIPER_POP, ...PIPER_CRUMBLE,
  ],
};
