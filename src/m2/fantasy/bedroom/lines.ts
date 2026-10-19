// What's said outside the great pixie's bedroom and in PIPER THE PIXIE's fight, by voice (fantasy/voices.ts gathers
// it; tools/voices records it). In the user's voice: blunt, short, vulgar, specific; talk less; fit the trigger. Picked
// with pickLine (never twice in 45 s). Clean / shitty / naked pools for every group, his and hers, intro to death (the
// naked ones play up the boner: hard in the hall, dead at the sight of her, hopeful at the supermodel, dead again).
//
// Her LUST was for men killing each other for her; now one's at her door insulting her, and it's soured into rage.
// The elemental shouts are the user's words, as they are ("FIRE BALL!", "ICE BALL!", "LIGHTNING BOLT!"). Pure data.

import { allOf, PIPER_VOICE, type ByPants, type HurtTable } from '../talk';

export { PIPER_VOICE };

// ---------------------------------------------------------------------------------------------------------------
// The hall and the door

/** In off the glass, outside her door (the first time this visit). */
export const MH_HALL: ByPants = {
  clean: ['HER BEDROOM DOOR. THIS IS IT.', 'A PILE OF DEAD SUITORS AND A DOOR. KNOCK KNOCK.'],
  shitty: ['SHE\'S BEHIND THAT DOOR. MY SHIT\'S BEHIND ME.', 'NO TIME TO CHANGE. SHE\'LL LOVE IT.'],
  nude: ['ALREADY NAKED. ALREADY HARD. ALREADY HERE.', 'THE BONER FOUND THE BEDROOM BEFORE I DID.'],
};
/** The boot going into her door. */
export const MH_KICK: ByPants = {
  clean: ['ROOM SERVICE!', 'HONEY, I\'M HOME!'],
  shitty: ['SPECIAL DELIVERY! IT\'S IN MY PANTS!', 'OPEN UP! I BROUGHT A SMELL!'],
  nude: ['ROOM SERVICE! IT\'S HARD!', 'KNOCK KNOCK! WHO\'S THERE? MY DICK!'],
};
/** Her, on her chaise, the door flat on her carpet: still purring (she can't see him yet for the dust). */
export const PIPER_REVEAL: ByPants = {
  clean: ['MMM. THE LAST ONE STANDING. COME TO MOMMA.', 'YOU KILLED THEM ALL. FOR LITTLE OLD ME.'],
  shitty: ['YOU WADED THROUGH BLOOD AND SHIT FOR ME. I CAN SMELL IT.', 'MMM. A MAN WHO SOILS HIMSELF FOR ME.'],
  nude: ['NAKED ALREADY? THE BLOOD GOT YOU GOING TOO?', 'OOH. YOU CAME DRESSED FOR THE AUDIENCE.'],
};
/** The dust settles: him seeing her. (Naked: as the boner goes down.) */
export const MH_SEES: ByPants = {
  clean: ['OH NO.', 'THAT\'S PIPER? THAT\'S A WHOLE PIPELINE.'],
  shitty: ['I JUST SHIT MYSELF AGAIN. LOOKING AT YOU.', 'OH GOD. MORE CAME OUT.'],
  nude: ['IT\'S GOING DOWN. IT\'S GOING DOWN FAST.', 'ABORT. ABORT. MAN DOWN.'],
};
/** The insult: how fat she is. */
export const MH_FAT: ByPants = {
  clean: ['YOU\'RE NOT A PIXIE. YOU ATE THE PIXIE.', 'I KILLED A DOZEN GUYS FOR A HOT TUB IN A DRESS.', 'THOSE WINGS COULDN\'T LIFT ONE OF YOUR CHINS.'],
  shitty: ['I SHIT MY PANTS AND I\'M STILL NOT THE GROSSEST THING IN HERE.', 'MY PANTS ARE CARRYING LESS THAN THAT DRESS.'],
  nude: ['MY DICK TOOK ONE LOOK AT YOU AND WENT BACK INSIDE.', 'YOU KILLED MY BONER. THAT\'S MURDER.'],
};
/** ...and how ugly. */
export const MH_UGLY: ByPants = {
  clean: ['AND THAT FACE. YOUR VOICE WROTE A CHECK YOUR FACE CAN\'T CASH.', 'YOU SOUND LIKE A TEN. YOU LOOK LIKE TEN OF YOU.'],
  shitty: ['YOU\'RE UGLIER THAN WHAT\'S IN MY PANTS.', 'I\'D RATHER SIT IN THIS THAN SIT ON THAT.'],
  nude: ['I\'M NAKED AND YOU\'RE THE ONE WHO SHOULD COVER UP.', 'PUT SOME CLOTHES ON. MORE. ALL OF THEM.'],
};
/** Insulted: the lust gone sour. She wanted men to die for her, not this. */
export const PIPER_ENRAGED: ByPants = {
  clean: ['FAT?! MEN DIED FOR THIS! DOZENS OF THEM!', 'THEY WERE SUPPOSED TO KILL EACH OTHER FOR ME! NOT INSULT ME!'],
  shitty: ['A MAN IN SHITTY PANTS DOES NOT CALL ME UGLY!', 'YOU SMELL LIKE A SEWER AND I\'M THE UGLY ONE?!'],
  nude: ['YOUR LITTLE LIMP DICK DOESN\'T GET A VOTE!', 'I\'VE SEEN BIGGER ON A PIXIE! AND I EAT PIXIES!'],
};
/** ...and on. */
export const PIPER_FIGHT: ByPants = {
  clean: ['NOW YOU DIE FOR ME TOO!', 'I\'LL BLEED YOU MYSELF!'],
  shitty: ['I\'LL SQUASH THE SHIT RIGHT OUT OF YOU!', 'YOU\'LL DIE IN THOSE PANTS!'],
  nude: ['I\'LL SIT ON YOU TILL IT FALLS OFF!', 'I\'M GOING TO FLATTEN THAT LITTLE THING!'],
};
/** His answer, and it's on. */
export const MH_ON: ByPants = {
  clean: ['COME ON THEN, LARD WINGS.', 'BRING IT, PIXIE PIG.'],
  shitty: ['I\'M ALREADY SHITTING. YOU CAN\'T SCARE ME.', 'COME ON. I\'VE GOT NOTHING LEFT TO LOSE IN HERE.'],
  nude: ['COME ON. IT CAN\'T GET ANY SMALLER.', 'NAKED, LIMP, AND READY TO FIGHT.'],
};
/** A retry (the door already down): her, waiting for him. */
export const PIPER_AGAIN: ByPants = {
  clean: ['BACK FOR SECONDS? SO AM I.', 'YOU AGAIN. CALL ME FAT AGAIN. I DARE YOU.'],
  shitty: ['THE SHITTY ONE\'S BACK. OPEN A WINDOW.', 'YOU DIED AND YOU STILL SMELL.'],
  nude: ['BACK AGAIN, NAKED? STILL LIMP?', 'THE LITTLE DICK RETURNS.'],
};
export const MH_AGAIN: ByPants = {
  clean: ['ROUND TWO, FATSO.', 'I\'M BACK. YOU\'RE STILL HUGE.'],
  shitty: ['BACK. STILL SHITTY. STILL PRETTIER THAN YOU.', 'I SHIT MYSELF DYING. THANKS FOR THAT.'],
  nude: ['BACK. STILL NAKED. STILL NOT INTERESTED.', 'LET\'S GO. IT\'S NOT COMING BACK UP.'],
};

// ---------------------------------------------------------------------------------------------------------------
// The fight

/** Her, now and then (when nobody's talking). */
export const PIPER_TAUNT: ByPants = {
  clean: ['THEY ALL DIED PRETTY FOR ME. YOU\'LL DIE UGLY.', 'COME HERE AND SAY FAT AGAIN.', 'I WAS GOING TO WATCH YOU DIE. NOW I\'LL DO IT.'],
  shitty: ['STAND STILL, SHIT PANTS.', 'I CAN SMELL WHERE YOU\'RE HIDING.', 'EVEN THE SUITORS DIED CLEANER THAN YOU.'],
  nude: ['PUT THAT LITTLE THING AWAY AND DIE.', 'NOTHING TO SEE HERE. LITERALLY.', 'COME HERE, SHRIMP. LET MOMMA FLATTEN YOU.'],
};
/** Up she goes: the leap (a shout as she crouches). */
export const PIPER_LEAP: ByPants = {
  clean: ['BELLY FLOP!', 'HERE COMES MOMMA!', 'DROP ZONE!'],
  shitty: ['SQUISH THE SHIT OUT OF YOU!', 'CANNONBALL!', 'HERE COMES MOMMA!'],
  nude: ['SIT ON IT!', 'BELLY FLOP!', 'FLATTEN THE SHRIMP!'],
};
/** Hit (a bark, now and then). */
export const PIPER_HURT: ByPants = {
  clean: ['OW! MY FIGURE!', 'NOT THE DRESS!', 'YOU BRUTE!'],
  shitty: ['DON\'T TOUCH ME WITH THOSE HANDS!', 'EW! IT\'S ON ME!'],
  nude: ['DON\'T RUB THAT ON ME!', 'KEEP THAT AWAY FROM ME!'],
};
/** A hole in her (the flintlock): the leak, and off she goes round the room. */
export const PIPER_HOLE: ByPants = {
  clean: ['I\'M LEAKING! PLUG IT!', 'MY CURVES! THEY\'RE GETTING AWAY!', 'WHEEEE! NO! NOT WHEEE!'],
  shitty: ['NOW WE\'RE BOTH LEAKING!', 'IT\'S COMING OUT OF ME! LIKE YOU!'],
  nude: ['I\'M DEFLATING! LIKE YOUR DICK!', 'PLUG IT! NOT WITH THAT!'],
};
/** Low (a third left). */
export const PIPER_LOW: ByPants = {
  clean: ['THIS IS NOT HOW THE AUDIENCE GOES!', 'NO ONE WAS SUPPOSED TO GET THIS FAR!'],
  shitty: ['I WILL NOT DIE TO A MAN WHO SMELLS LIKE THAT!', 'NOT LIKE THIS! NOT TO SHITTY PANTS!'],
  nude: ['I WILL NOT DIE TO A LIMP NAKED MAN!', 'NOT TO A NAKED NOBODY!'],
};
/** The elemental throws: the user's shouts, as they are. */
export const ELEMENT_SHOUT = { fire: ['FIRE BALL!'], ice: ['ICE BALL!'], shock: ['LIGHTNING BOLT!'] } as const;

/** Him, now and then. */
export const MH_TAUNT: ByPants = {
  clean: ['YOU\'RE BREAKING YOUR OWN HOUSE, LARD WINGS.', 'THOSE WINGS ARE DECORATIVE, RIGHT?', 'NICE JUMP. THE FLOOR DISAGREES.'],
  shitty: ['EVERY TIME YOU LAND, MORE COMES OUT OF ME.', 'STOP JUMPING. I\'M RUNNING OUT OF PANTS.'],
  nude: ['EVERYTHING\'S SWINGING. NONE OF IT FOR YOU.', 'EACH TIME YOU LAND IT SHRINKS A LITTLE MORE.'],
};
/** Him thinking out loud about the flintlock (only if he's got it): he's hitting her with anything else. */
export const MH_HINT: ByPants = {
  clean: ['SHE\'S BASICALLY A BALLOON. I\'VE GOT A GUN THAT MAKES HOLES.', 'ONE BALL FROM THE FLINTLOCK. POP HER.'],
  shitty: ['I SHOULD PUT A HOLE IN HER. THE FLINTLOCK.', 'SHE\'S FULL OF SOMETHING. LET IT OUT. FLINTLOCK.'],
  nude: ['SHE NEEDS A PRICK. THE FLINTLOCK. NOT MINE.', 'BLOW A HOLE IN HER. THE OLD PISTOL.'],
};
/** He's put a hole in her. */
export const MH_HOLE: ByPants = {
  clean: ['LOOK AT HER GO!', 'SHE\'S A LET-GO BALLOON!', 'THAT\'S NOT BLOOD. THAT\'S GRAVY.'],
  shitty: ['NOW SHE KNOWS HOW I FEEL!', 'SHE\'S LEAKING WORSE THAN ME!'],
  nude: ['NOW SHE\'S DEFLATING TOO!', 'SHE\'S GOING DOWN FASTER THAN MY DICK DID!'],
};
/** The room coming apart: what's loose now (his first look at each). */
export const MH_LOOSE: Record<'heat' | 'nitro' | 'wires', ByPants> = {
  heat: {
    clean: ['A STEAM PIPE. NOW IT\'S A FLAMETHROWER.', 'SHE BROKE THE HEAT. AVOID THE HEAT.'],
    shitty: ['A FIRE PIPE. MY PANTS ARE FLAMMABLE NOW.', 'DON\'T STAND BY THE FIRE. SHIT BURNS.'],
    nude: ['FIRE PIPE. NOTHING BETWEEN IT AND MY BALLS.', 'NAKED NEAR AN OPEN FLAME. GREAT.'],
  },
  nitro: {
    clean: ['LIQUID NITROGEN. THE PARK\'S ICE EFFECTS.', 'THAT STUFF FREEZES YOU SOLID.'],
    shitty: ['FROZEN SHIT. THAT\'S A NEW ONE.', 'IF THAT HITS ME, IT\'S A SHITSICLE.'],
    nude: ['LIQUID NITROGEN. AND I\'M NAKED. GREAT.', 'IF THAT HITS MY BALLS THEY\'RE GONE.'],
  },
  wires: {
    clean: ['LIVE WIRES IN THE WATER. STAY OUT OF THE PUDDLE.', 'SHE FLOODED THE ROOM AND DROPPED THE WIRES IN.'],
    shitty: ['WATER AND WIRES. AND MY PANTS ARE ALREADY WET.', 'DON\'T STEP IN THE SPARKY PUDDLE.'],
    nude: ['NAKED AND WET IS HOW YOU GET COOKED.', 'KEEP MY BALLS OUT OF THAT PUDDLE.'],
  },
};
/** Frozen solid: the mash. */
export const MH_FROZEN: ByPants = {
  clean: ['C-C-COLD!', 'I CAN\'T MOVE!'],
  shitty: ['IT FROZE IN MY PANTS!', 'SHITSICLE!'],
  nude: ['MY BALLS! THEY\'RE INSIDE ME!', 'SHRINKAGE! SHRINKAGE!'],
};

// ---------------------------------------------------------------------------------------------------------------
// Her deaths

/** Beaten (any way but the flintlock): one last belly flop, at him. */
export const PIPER_LAST: ByPants = {
  clean: ['ONE LAST BELLY FLOP!', 'IF I GO, THE FLOOR GOES WITH ME!'],
  shitty: ['ONE MORE! RIGHT ON YOUR SHITTY HEAD!', 'I\'LL SIT ON YOU TILL YOU POP!'],
  nude: ['ONE MORE! RIGHT ON YOUR LITTLE DICK!', 'I\'LL FLATTEN THAT THING FOR GOOD!'],
};
/** THE CORK (her usual death): wedged in the floor to the waist. */
export const PIPER_STUCK: ByPants = {
  clean: ['I\'M STUCK! DON\'T YOU DARE LOOK AT ME!', 'GET ME OUT! MY LEGS ARE IN THE GIFT SHOP!'],
  shitty: ['I\'M STUCK! AND IT SMELLS UP HERE!', 'PULL ME OUT! NOT WITH THOSE HANDS!'],
  nude: ['DON\'T COME NEAR ME WITH THAT THING!', 'I\'M STUCK! KEEP YOUR LITTLE DICK AWAY!'],
};
/** The pressure under her. */
export const MH_PRESSURE: ByPants = {
  clean: ['THE PIPES ARE BACKING UP UNDER HER.', 'SHE\'S A CORK. SHE\'S A CORK IN THE PLUMBING.'],
  shitty: ['THAT\'S A LOT OF PRESSURE. I KNOW THE FEELING.', 'SOMETHING\'S BUILDING UP. I KNOW THAT SOUND.'],
  nude: ['SOMETHING\'S ABOUT TO BLOW. NOT ME.', 'SHE\'S PLUGGING THE PIPES. STAND BACK.'],
};
/** Popped out like a champagne cork, up through the roof (the scream). */
export const PIPER_POP = ['NOOOOOOOOOO!', 'WHY DID I BUILD A TALL CASTLE!'];
/** After the distant thud. */
export const MH_WON: ByPants = {
  clean: ['AUDIENCE OVER.', 'THAT\'S WHAT YOU GET FOR SOUNDING HOT.', 'CHAMPAGNE. FOR ME.'],
  shitty: ['SHE SHAT ON THE WAY UP. NOW WE\'RE EVEN.', 'NOBODY CALLS ME UGLY AND SHITTY AND LIVES.'],
  nude: ['I CAME. I SAW. IT WENT LIMP.', 'NOT THE AUDIENCE I WANTED. STILL WON.'],
};

/** THE DEFLATED BALLOON (the weakness): leaking down to a supermodel... */
export const PIPER_SUPERMODEL: ByPants = {
  clean: ['OH MY GOD. I\'M GORGEOUS.', 'LOOK AT ME. I\'M A TEN.'],
  shitty: ['LOOK AT ME! EVEN YOU STINK LESS NOW!', 'I\'M GORGEOUS! TOO GOOD FOR YOU, SHIT PANTS!'],
  nude: ['OH, NOW IT WAKES UP?', 'LOOK WHO\'S STANDING UP NOW.'],
};
export const MH_SUPERMODEL: ByPants = {
  clean: ['WAIT. WAIT WAIT WAIT.', 'OKAY. OKAY, HOLD ON. LET\'S TALK.'],
  shitty: ['HOLD ON. LET ME CHANGE MY PANTS.', 'WAIT. I CAN CLEAN UP. GIVE ME A MINUTE.'],
  nude: ['HELLO AGAIN, OLD FRIEND.', 'IT\'S ALIVE. IT\'S ALIVE!'],
};
/** ...and past it. */
export const PIPER_TOO_THIN: ByPants = {
  clean: ['WAIT. TOO MUCH. STOP THE LEAK.', 'I CAN SEE MY OWN SPINE.'],
  shitty: ['STOP! I CAN\'T EVEN SMELL YOU ANYMORE!', 'STOP! I\'M FADING!'],
  nude: ['IT\'S GOING DOWN AGAIN, ISN\'T IT.', 'DON\'T LOOK AT ME LIKE THAT. AGAIN.'],
};
export const MH_TOO_THIN: ByPants = {
  clean: ['NOPE. TOO FAR. WAY TOO FAR.', 'EAT A SANDWICH. EAT NINE.'],
  shitty: ['NOW YOU NEED THE FOOD MORE THAN I NEED THE PANTS.', 'SHE\'S A COAT RACK.'],
  nude: ['AND IT\'S GONE AGAIN.', 'DOWN AGAIN. THIS IS EXHAUSTING.'],
};
/** The last thing she says before she crumbles. */
export const PIPER_CRUMBLE = ['WORTH... IT...', 'AT LEAST... I DIED THIN...'];
export const MH_WON_WEAK: ByPants = {
  clean: ['SHE WENT FROM TOO MUCH TO NOTHING.', 'POPPED. LIKE A BALLOON.'],
  shitty: ['SHE LEAKED OUT WORSE THAN ME. RESPECT.', 'THAT\'S A LOT OF GRAVY ON THE FLOOR.'],
  nude: ['FOR ONE SECOND THERE, I WAS IN.', 'GOODBYE, SUPERMODEL. GOODBYE, BONER.'],
};

/** A grab at her: too much of her. */
export const GRAB_PIPER = ['I CAN\'T GET MY ARMS AROUND HER!', 'THERE\'S NO END TO HER!', 'IT\'S LIKE HUGGING A WATERBED!'];

// ---------------------------------------------------------------------------------------------------------------
// What hurts him in here, and the death screens (28 characters at most)

export const SRC = {
  heat: 'm2:fa_pp_heat', nitro: 'm2:fa_pp_nitro', shock: 'm2:fa_pp_shock',
  fireball: 'm2:fa_pp_fireball', iceball: 'm2:fa_pp_iceball', bolt: 'm2:fa_pp_bolt',
  debris: 'm2:fa_pp_debris', chandelier: 'm2:fa_pp_chandelier', slam: 'm2:fa_pp_slam', bounce: 'm2:fa_pp_bounce', body: 'm2:fa_pp_body',
} as const;
export const HURT: HurtTable = {
  [SRC.heat]: { hurt: ['THE PIPE! IT\'S ON FIRE!', 'MY ASS! IT\'S COOKING!', 'HOT! HOT HOT HOT!'], death: ['ROASTED BY THE PLUMBING', 'COOKED BY A HEAT MAIN'] },
  [SRC.nitro]: { hurt: ['COLD! IT BURNS COLD!', 'LIQUID NITROGEN! MY LEGS!', 'FROZEN STIFF! NOT THAT WAY!'], death: ['FLASH FROZEN', 'A MEATHEAD POPSICLE'] },
  [SRC.shock]: { hurt: ['THE PUDDLE\'S LIVE!', 'ZAPPED! THROUGH MY FEET!', 'MY FILLINGS!'], death: ['ELECTROCUTED IN A PUDDLE', 'FRIED IN HER BEDROOM'] },
  [SRC.fireball]: { hurt: ['FIRE BALL! IN THE FACE!', 'SHE THREW A FIRE!', 'MY HAIR!'], death: ['HIT BY A FAT FIRE BALL', 'FIREBALLED BY A PIXIE'] },
  [SRC.iceball]: { hurt: ['ICE BALL! I\'M STUCK!', 'SHE FROZE ME!', 'COLD BALLS! MINE!'], death: ['ICE BALLED TO DEATH', 'FROZEN BY A PIXIE'] },
  [SRC.bolt]: { hurt: ['LIGHTNING! INDOORS!', 'SHE THREW A LIGHTNING!', 'ZAPPED! BY A PIXIE!'], death: ['STRUCK BY A FAT PIXIE', 'LIGHTNING BOLTED'] },
  [SRC.debris]: { hurt: ['THE CEILING!', 'PLASTER! IN MY EYES!', 'HER HOUSE IS FALLING ON ME!'], death: ['BURIED UNDER HER CEILING', 'CRUSHED BY PLASTER'] },
  [SRC.chandelier]: { hurt: ['THE CHANDELIER!', 'CRYSTALS! EVERYWHERE!', 'A WHOLE LIGHT FIXTURE!'], death: ['CRUSHED BY A CHANDELIER', 'CHANDELIERED'] },
  [SRC.slam]: { hurt: ['SHE LANDED ON ME!', 'BELLY FLOPPED!', 'I CAN\'T BREATHE! SHE\'S ON ME!'], death: ['SAT ON BY A PIXIE', 'FLATTENED BY A BELLY FLOP'] },
  [SRC.bounce]: { hurt: ['SHE BOUNCED INTO ME!', 'A FLYING FAT LADY!', 'GRAVY! ALL OVER ME!'], death: ['HIT BY A LEAKING PIXIE', 'BOUNCED TO DEATH'] },
  [SRC.body]: { hurt: ['HER BELLY! LIKE A TRUCK!', 'BUMPED BY HER GUT!', 'SHE SHOVED ME!'], death: ['BELLY BUMPED TO DEATH', 'DIED IN HER ROLLS'] },
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
