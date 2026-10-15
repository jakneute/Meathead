// What's said on Stuntman Steve's stage, by voice (recorded with the rest: hollywood/voices.ts gathers these;
// tools/voices). In the user's voice (hollywood-spec.md): blunt, short, vulgar, specific; talk less; pick lines with
// pickLine; Steve (and the PA over him) gets clean / shitty / naked pools for every line group, intro to death.

import type { ByPants } from '../blvd/lines';
import { PA_VOICE } from '../blvd/lines';

export type { ByPants };
export { PA_VOICE };
export const STEVE_VOICE = 'm2.hollywood.steve';

// ---------------------------------------------------------------------------------------------------------------
// The intro: he comes down out of the tornado onto the stage, the crowd eats it up, Steve's furious

export const PA_LANDING: ByPants = {
  clean: ['WELL, FOLKS. THAT WASN\'T IN THE SHOW. GIVE IT UP!', 'A MAN JUST FELL OUT OF A TORNADO! GIVE IT UP!'],
  shitty: ['A MAN FELL OUT OF THE SKY AND SHIT HIMSELF ON IMPACT! GIVE IT UP!', 'THAT\'S NOT A SMOKE EFFECT, FOLKS. THAT\'S HIS PANTS.'],
  nude: ['A NAKED MAN JUST FELL OUT OF A TORNADO! GIVE IT UP!', 'FOLKS, THAT\'S NOT A COSTUME. THAT\'S ALL HIM.'],
};
export const MEATHEAD_LANDED = ['...I MEANT TO DO THAT.', 'STUCK IT. TEN OUT OF TEN.', 'WHERE THE FUCK AM I NOW?'];
export const STEVE_FUMING: ByPants = {
  clean: ['THEY\'RE CLAPPING. FOR HIM.', 'THAT\'S MY APPLAUSE. MINE.'],
  shitty: ['HE SHIT HIMSELF ON THE LANDING AND THEY\'RE CLAPPING?', 'THEY GAVE A STANDING OVATION TO A DIAPER.'],
  nude: ['A NAKED GUY FALLS OUT OF THE SKY AND GETS MY APPLAUSE?', 'THEY\'RE CHEERING HIS DICK. HIS DICK!'],
};
/** The user's line, verbatim (said whatever state he's in). */
export const STEVE_SHOWN_UP = 'NO ONE SHOWS ME UP. I WAS IN A REAL HOLLYWOOD MOVIE. ONCE. FOR ABOUT 2 SECONDS.';
export const STEVE_POSSE: ByPants = {
  clean: ['BOYS! RUN HIM OFF MY STAGE!', 'POSSE! FIRE \'EM UP! RUN HIM DOWN!'],
  shitty: ['BOYS! RUN HIM DOWN! DON\'T GET IT ON THE TIRES!', 'POSSE! RUN HIM OFF MY STAGE! WINDOWS UP!'],
  nude: ['POSSE! RUN THAT NAKED FREAK OFF MY STAGE!', 'BOYS! RUN HIM DOWN! AIM FOR THE... JUST AIM LOW!'],
};

// ---------------------------------------------------------------------------------------------------------------
// The fight

export const STEVE_TAUNT: ByPants = {
  clean: ['I DID THIS FOR CANNON! IN EIGHTY-SIX!', 'THAT\'S HOW YOU DRIFT, KID!', 'STAY OVER THERE! THAT\'S YOUR MARK!', 'I STILL GOT IT! FROM HERE!'],
  shitty: ['YOU\'RE LEAKING ON MY STAGE!', 'THE CHEAP SEATS CAN SMELL YOU!', 'STAY OVER THERE! DOWNWIND!'],
  nude: ['PUT IT AWAY! THIS IS A FAMILY SHOW!', 'I\'VE SEEN BIGGER ON A CRASH DUMMY!', 'STAY OVER THERE! WITH THAT!'],
};
/** A red car sent at him. */
export const STEVE_SEND: ByPants = {
  clean: ['HIT IT!', 'ACTION!', 'RUN HIM OVER!', 'GO! GO! GO!'],
  shitty: ['RUN OVER THE SHITTY GUY!', 'HIT HIM! HOSE THE BUMPER AFTER!'],
  nude: ['RUN OVER THE NAKED GUY!', 'HIT HIM! AIM LOW! HE\'S GOT NO BELT!'],
};
/** A blue car up a ramp, through a hoop, down on him. */
export const STEVE_RAMP: ByPants = {
  clean: ['THROUGH THE HOOP! ON HIS HEAD!', 'JUMP IT!', 'AIR MAIL!'],
  shitty: ['LAND ON HIM! SQUASH IT OUT OF HIM!', 'JUMP IT! LAND IN THE SMELL!'],
  nude: ['LAND ON HIM! FLATTEN THE WIENER!', 'JUMP IT! RIGHT ON THE NAKED PART!'],
};
/** He's getting close. */
export const STEVE_TOO_CLOSE: ByPants = {
  clean: ['TOO CLOSE! TOO CLOSE!', 'GET HIM AWAY FROM ME!'],
  shitty: ['GET HIM AWAY! THE SMELL!', 'HE\'S CLOSE! I CAN TASTE IT!'],
  nude: ['GET HIM AWAY! IT\'S SWINGING AT ME!', 'TOO CLOSE! I CAN SEE EVERYTHING!'],
};
/** He's got there: Steve flails. */
export const STEVE_FLAIL: ByPants = {
  clean: ['NOT THE FACE! THE FACE IS INSURED!', 'NO NO NO NO NO!', 'I\'M A PROFESSIONAL! STOP!'],
  shitty: ['DON\'T TOUCH ME! YOU\'RE MOIST!', 'GET YOUR SHIT OFF MY SUIT!'],
  nude: ['DON\'T RUB THAT ON ME!', 'PUT IT AWAY! PUT IT AWAY!'],
};
/** A grab at him: he squirts out of it. */
export const STEVE_SLIP: ByPants = {
  clean: ['BABY OIL, BABY! FORTY YEARS OF IT!', 'NOBODY HOLDS STEVE!', 'GREASED FOR STUNTS!'],
  shitty: ['YOUR HANDS ARE BROWN! DON\'T!', 'BABY OIL BEATS WHATEVER THAT IS!'],
  nude: ['NAKED WRESTLING IS A DIFFERENT SHOW!', 'BABY OIL AND A NAKED GUY! THIS LOOKS BAD!'],
};
/** Out of there on a tow rope, dragged on his belly to the other end. */
export const STEVE_TOW: ByPants = {
  clean: ['TOW ROPE! GET ME OUTTA HERE!', 'THE DRAG STUNT! I STILL GOT IT!'],
  shitty: ['TOW ME! AWAY FROM THE SMELL!', 'DRAG ME! ANYWHERE! UPWIND!'],
  nude: ['TOW ME! AWAY FROM THAT THING!', 'DRAG ME! I DON\'T WANNA SEE IT!'],
};
export const STEVE_HURT: ByPants = {
  clean: ['MY HIP!', 'OW! I\'M FIFTY-NINE!', 'THAT\'S MY GOOD KNEE!'],
  shitty: ['YOU GOT IT ON MY SUIT!', 'OW! AND EW!'],
  nude: ['OW! SOMETHING SLAPPED ME! I HOPE IT WAS A HAND!', 'DON\'T HIT ME WITH... OW!'],
};
/** The user's line, verbatim: the first time the lightning gets him (whatever state he's in); the rest after. */
export const STEVE_CONDUCTIVE = 'WHY DID I WEAR A CONDUCTIVE SUIT';
export const STEVE_ZAPPED: ByPants = {
  clean: ['IT\'S POLYESTER! IT\'S ALL POLYESTER!', 'MY FILLINGS! MY FILLINGS!', 'THE ZIPPER! THE ZIPPER\'S METAL!'],
  shitty: ['I\'M FRYING! IT STILL SMELLS BETTER THAN YOU!', 'LIGHTNING! AND THE SMELL! AT ONCE!'],
  nude: ['HE\'S NAKED AND I\'M THE ONE GETTING ZAPPED?!', 'I\'M THE LIGHTNING ROD? LOOK AT HIM!'],
};
/** The lightning sets the stage's pyrotechnics off (every time): the blast throws Meathead back down the stage. The
 *  user's line, verbatim, clean; the same said at him as he is otherwise. */
export const STEVE_PYRO: ByPants = {
  clean: ['I FORGOT ABOUT THOSE.'],
  shitty: ['I FORGOT ABOUT THOSE. AT LEAST IT BURNS THE SMELL OFF.'],
  nude: ['I FORGOT ABOUT THOSE. HOPE IT SINGED THAT THING.'],
};
/** One of his own cars thrown at him. */
export const STEVE_CAR_HIT: ByPants = {
  clean: ['MY OWN CAR!', 'THAT\'S A RENTAL!', 'WHO TAUGHT HIM THAT?!'],
  shitty: ['MY CAR! WITH HIS HANDPRINTS ON IT!', 'HE THREW A CAR! A BROWN CAR NOW!'],
  nude: ['HE THREW A CAR AT ME! NAKED!', 'A NAKED MAN THREW A CAR AT ME!'],
};
/** Under a quarter: once. */
export const STEVE_LOW: ByPants = {
  clean: ['I CAN\'T FEEL MY NECK. THE BRACE IS HOLDING MY HEAD ON.', 'OKAY. OKAY. BIG FINISH. ANY MINUTE.'],
  shitty: ['I\'M GONNA DIE SMELLING THAT.', 'NOT LIKE THIS. NOT DOWNWIND.'],
  nude: ['I\'M NOT DYING WITH THAT THING LOOKING AT ME.', 'NOT LIKE THIS. NOT WITH HIS THING OUT.'],
};

// ---------------------------------------------------------------------------------------------------------------
// His deaths: the stunt (any way but the weakness) and the lightning rod (the spellbook's lightning)

/** Beaten: one last stunt, the one he's known for. */
export const STEVE_LAST_STUNT: ByPants = {
  clean: ['LADIES AND GENTLEMEN... THE STEVE SIDESTEP!'],
  shitty: ['LADIES AND GENTLEMEN... THE STEVE SIDESTEP! HOLD YOUR NOSES!'],
  nude: ['LADIES AND GENTLEMEN... THE STEVE SIDESTEP! COVER THE KIDS\' EYES!'],
};
/** ...and mid-step, his back goes. */
export const STEVE_BACK: ByPants = {
  clean: ['MY BACK!'],
  shitty: ['MY BACK! THIS IS YOUR FAULT!'],
  nude: ['MY BACK! STOP LOOKING!'],
};
export const STEVE_FRIED: ByPants = {
  clean: ['I\'M... A LIGHTNING... ROD...', 'THE SUIT... WAS... A MISTAKE...'],
  shitty: ['AT LEAST... I CAN\'T SMELL YOU... ANYMORE...'],
  nude: ['THE LAST THING... I SEE... IS THAT...'],
};
export const PA_DEATH: ByPants = {
  clean: ['AND THAT WAS STUNTMAN STEVE, FOLKS. HE MISSED THE MAT. NO REFUNDS.', 'STUNTMAN STEVE, FOLKS. ALL SHOWS ARE CANCELED. FOREVER.'],
  shitty: ['STUNTMAN STEVE, FOLKS. KILLED BY A MAN WHO SHAT HIMSELF. NO REFUNDS.'],
  nude: ['STUNTMAN STEVE, FOLKS. KILLED BY A NAKED MAN. NO REFUNDS. NO PHOTOS.'],
};
export const PA_DEATH_FRIED: ByPants = {
  clean: ['LADIES AND GENTLEMEN... THE HUMAN LIGHTNING ROD! HOLD YOUR APPLAUSE. HE\'S DEAD.'],
  shitty: ['THE HUMAN LIGHTNING ROD, FOLKS! THAT SMELL IS HIM. MOSTLY.'],
  nude: ['THE HUMAN LIGHTNING ROD, FOLKS! THE NAKED MAN IS NOT PART OF THE SHOW.'],
};

// ---------------------------------------------------------------------------------------------------------------
// Meathead

export const MEATHEAD_WON = ['MISSED THE MAT, DUMBASS.', 'TWO SECONDS OF FAME. ZERO SECONDS OF STEVE.'];
export const MEATHEAD_WON_WEAK = ['WEAR COTTON, DUMBASS.', 'STUNTMAN STEVE. MEDIUM WELL.'];
/** Something that isn't the book on Steve: a think out loud now and then. */
export const MEATHEAD_HINT = [
  'THAT SUIT\'S ALL ZIPPERS AND RIVETS. BET IT CONDUCTS.',
  'THE BOOK\'S GOT LIGHTNING IN IT. HE\'S GOT A METAL SUIT. HMM.',
  'SHOOT THE CARS? NAH. THE BOOK\'S GOT A ROCK FOR EVERY CAR.',
];
/** A grab at Steve (the grab's own pool for his kind: moves/grab.ts tooBig). */
export const GRAB_STEVE = ['HE\'S GREASED! HE\'S GREASED UP!', 'LIKE GRABBING A WET HOT DOG!', 'WHAT IS HE BASTED IN?!'];
/** A grab at a car, not bulked up. */
export const GRAB_CAR = ['IT\'S A WHOLE CAR!', 'I CAN\'T LIFT A CAR! NOT LIKE THIS!', 'I\'D HAVE TO BULK UP FOR THAT!'];

// ---------------------------------------------------------------------------------------------------------------
// What hurts him here (by source), and the death screen

export const HURT: Record<string, { hurt: string[]; death: string[] }> = {
  'm2:stunt_drift': {
    hurt: ['DRIFTED! RIGHT INTO ME!', 'TIRE MARKS ON MY ASS!', 'THE BACK END GOT ME!'],
    death: ['DRIFTED INTO BY A STUNT DRIVER', 'TOKYO DRIFTED', 'SIDESWIPED AT A STUNT SHOW'],
  },
  'm2:stunt_headon': {
    hurt: ['HEAD-ON! I\'M ON FIRE!', 'BUMPER TO THE BALLS!', 'HIT BY A CAR! AGAIN!'],
    death: ['HIT HEAD-ON BY A STUNT CAR', 'HE LOST A GAME OF CHICKEN', 'BLOWN UP BY A STUNT CAR'],
  },
  'm2:stunt_landing': {
    hurt: ['A CAR LANDED ON ME!', 'A CAR! FROM THE SKY!', 'THROUGH THE HOOP AND ONTO MY HEAD!'],
    death: ['A CAR JUMPED THROUGH A HULA HOOP AND LANDED ON HIM', 'CRUSHED BY A FLYING CAR', 'IT STUCK THE LANDING. ON HIM.'],
  },
  'm2:stunt_wall': {
    hurt: ['RODE IT INTO THE WALL!', 'SHOULDA GOT OFF!', 'WHO PARKS IN A WALL?!'],
    death: ['RODE A STUNT CAR INTO A WALL', 'ROOF RIDER. WALL WINNER.'],
  },
  'm2:steve_flail': {
    hurt: ['HE SLAPPED ME!', 'STOP FLAILING, GRANDPA!', 'OW! A WET SLAP!'],
    death: ['SLAPPED TO DEATH BY A FIFTY-NINE-YEAR-OLD STUNTMAN', 'FLAILED TO DEATH', 'STUNTMAN STEVE\'S ONLY KILL'],
  },
};

const pools = (r: ByPants) => [...r.clean, ...r.shitty, ...r.nude];
export const VOICE_LINES: Record<string, string[]> = {
  meathead: [
    ...MEATHEAD_LANDED, ...MEATHEAD_WON, ...MEATHEAD_WON_WEAK, ...MEATHEAD_HINT, ...GRAB_STEVE, ...GRAB_CAR,
    ...Object.values(HURT).flatMap(h => h.hurt),
  ],
  death: Object.values(HURT).flatMap(h => h.death),
  [PA_VOICE]: [...pools(PA_LANDING), ...pools(PA_DEATH), ...pools(PA_DEATH_FRIED)],
  [STEVE_VOICE]: [
    ...pools(STEVE_FUMING), STEVE_SHOWN_UP, ...pools(STEVE_POSSE), ...pools(STEVE_TAUNT), ...pools(STEVE_SEND),
    ...pools(STEVE_RAMP), ...pools(STEVE_TOO_CLOSE), ...pools(STEVE_FLAIL), ...pools(STEVE_SLIP), ...pools(STEVE_TOW),
    ...pools(STEVE_HURT), STEVE_CONDUCTIVE, ...pools(STEVE_ZAPPED), ...pools(STEVE_PYRO), ...pools(STEVE_CAR_HIT), ...pools(STEVE_LOW),
    ...pools(STEVE_LAST_STUNT), ...pools(STEVE_BACK), ...pools(STEVE_FRIED),
  ],
};
