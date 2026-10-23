// What's said on Stuntman Steve's stage, by voice (recorded with the rest: hollywood/voices.ts gathers these;
// tools/voices). In the user's voice (hollywood-spec.md): blunt, short, vulgar, specific; talk less; pick lines with
// pickLine; Steve (and the PA over him) gets clean / shitty / naked pools for every line group, intro to death.

import type { ByPants } from '../blvd/lines';
import { PA_VOICE } from '../blvd/lines';

export type { ByPants };
export { PA_VOICE };
export const STEVE_VOICE = 'm2.hollywood.steve';

// ---------------------------------------------------------------------------------------------------------------
// The intro: he comes down out of the tornado onto the stage, the crowd eats it up, Steve's furious. Steve is ENVY
// (the user: "stuntman is more envious because he got upstaged"): what he says is about the spotlight, the crowd,
// the applause, the jumbotron, his two seconds; what Meathead's got that he hasn't. He acts on it like a coward.

export const PA_LANDING: ByPants = {
  clean: ["FOLKS, THAT WASN'T IN THE SHOW. AND IT BEAT THE WHOLE SHOW. GIVE IT UP!", 'A MAN JUST FELL OUT OF A TORNADO! STEVE, TAKE NOTES!'],
  shitty: ["A MAN FELL OUT OF THE SKY AND SHIT HIMSELF ON IMPACT! STILL BEAT STEVE'S ENTRANCE!", "THAT'S NOT A SMOKE EFFECT, FOLKS. THAT'S COMING OUT OF HIS PANTS."],
  nude: ["A NAKED MAN JUST FELL OUT OF A TORNADO! STEVE, THAT'S HOW YOU OPEN A SHOW!", "FOLKS, THAT'S NOT A PROP. THAT'S HIS ACTUAL WIENER."],
};
export const MEATHEAD_LANDED = ['...I MEANT TO DO THAT.', 'STUCK IT. TEN OUT OF TEN.', 'WHERE THE FUCK AM I? KANSAS?'];
/** A retry (the intro seen): playing to the crowd from his end, a taunt, before the cars come. */
export const STEVE_ENTRANCE: ByPants = {
  clean: ["HE'S BACK, FOLKS! LET'S KILL HIM AGAIN!", 'TAKE TWO! THIS TIME, STAY DEAD!', 'YOU AGAIN? GO GET YOUR OWN SHOW!', "SEE, FOLKS? HE DIES! STEVE DOESN'T! CLAP FOR STEVE!"],
  shitty: ['TAKE TWO! SOMEBODY HOSE OFF THE STUNT DOUBLE!', "HE'S BACK, FOLKS! STILL SHAT HIMSELF! NOW WHO'S THE STAR?", "TAKE TWO! HE DIDN'T EVEN CHANGE HIS DIAPER!"],
  nude: ['TAKE TWO! WARDROBE! WARDROBE!', "HE'S BACK! STILL NAKED! EYES ON STEVE, FOLKS! EYES ON STEVE!", "THIS AIN'T THAT KIND OF STUNT SHOW! THAT'S THE VALLEY!"],
};
export const STEVE_FUMING: ByPants = {
  clean: ["THEY'RE CLAPPING. FOR HIM.", "THAT'S MY APPLAUSE. I PAID FOR THAT APPLAUSE.", "HE'S ON MY JUMBOTRON. MY JUMBOTRON.", "FORTY YEARS I'VE BEGGED FOR THAT CHEER. HE FELL INTO IT."],
  shitty: ["HE SHIT HIMSELF ON THE LANDING AND THEY'RE CLAPPING?", 'FORTY YEARS OF STUNTS AND THEY CLAP FOR A DIAPER.', 'AN INSTANT REPLAY. OF HIM SHITTING. I NEVER GOT AN INSTANT REPLAY.'],
  nude: ['A NAKED GUY FALLS OUT OF THE SKY AND GETS MY APPLAUSE?', "THEY'RE CHEERING HIS DICK. HIS DICK GETS A STANDING OVATION.", "HIS DICK'S ON MY JUMBOTRON. I GOT TWO SECONDS OF ELBOW."],
};
/** The user's line, verbatim (said whatever state he's in). */
export const STEVE_SHOWN_UP = 'NO ONE SHOWS ME UP. I WAS IN A REAL HOLLYWOOD MOVIE. ONCE. FOR ABOUT 2 SECONDS.';
export const STEVE_POSSE: ByPants = {
  clean: ['BOYS! RUN HIM OFF MY STAGE!', "POSSE! FIRE 'EM UP! HE'S NOT IN THE UNION!", 'BOYS! NOBODY GETS CHEERED ON MY STAGE BUT ME!'],
  shitty: ["BOYS! RUN HIM DOWN! DON'T GET IT ON THE TIRES!", 'POSSE! RUN HIM OFF MY STAGE! WINDOWS UP!', 'BOYS! HE STOLE MY CROWD! RUN HIM DOWN! HOLD YOUR NOSE!'],
  nude: ['POSSE! RUN THAT NAKED FREAK OFF MY STAGE!', 'BOYS! RUN HIM DOWN! AIM FOR THE... JUST AIM LOW!', "BOYS! THEY'RE CHEERING HIS DICK! RUN IT OVER!"],
};

// ---------------------------------------------------------------------------------------------------------------
// The fight

export const STEVE_TAUNT: ByPants = {
  clean: [
    'I DID THIS FOR CANNON! IN EIGHTY-SIX! WHERE WERE YOU?', 'LUCKY LANDING! ANYBODY CAN FALL OUT OF A TORNADO!',
    "STAY OVER THERE! THAT'S YOUR MARK! THE SPOTLIGHT'S MINE!", "FALLING ISN'T A STUNT! I'VE FALLEN BETTER DRUNK!",
    'I GOT TWO SECONDS! NOBODY GETS MORE THAN STEVE!', "THEY'RE CLAPPING FOR THE CARS! MY CARS! NOT YOU!",
  ],
  shitty: [
    "YOU'RE LEAKING ON MY STAGE!", 'YOU SHIT YOURSELF AND THEY STILL LIKE YOU MORE! HOW?!',
    "STAY OVER THERE! YOU'RE DOWNWIND OF THE NACHOS!", 'I BROKE MY BACK FOR THIS CROWD! YOU SHIT YOURSELF FOR IT!',
  ],
  nude: [
    'PUT IT AWAY! THIS IS A FAMILY SHOW!', "I'VE SEEN BIGGER ON A CRASH DUMMY!", 'NAKED IS A CHEAP POP! I NEVER NEEDED A CHEAP POP!',
    "ANYBODY GETS CHEERED WITH HIS DICK OUT! THAT'S CHEATING!",
  ],
};
/** A red car sent at him. */
export const STEVE_SEND: ByPants = {
  clean: ['HIT IT!', 'ACTION!', 'RUN HIM OVER!', 'FLOOR IT, GARY!', 'FLATTEN THE NEW GUY!'],
  shitty: ['RUN OVER THE SHITTY GUY!', "HIT HIM! I'M NOT DETAILING THAT!", "RUN DOWN EVERYBODY'S FAVORITE! HE SHIT HIMSELF!"],
  nude: ['RUN OVER THE NAKED GUY!', "HIT HIM! AIM LOW! HE'S GOT NO BELT!", 'RUN OVER HIS DICK! IT GOT MORE CHEERS THAN ME!'],
};
/** A blue car up a ramp, through a hoop, down on him. */
export const STEVE_RAMP: ByPants = {
  clean: ['THROUGH THE HOOP! ON HIS HEAD!', 'JUMP IT!', "NOW THAT'S AN ENTRANCE! LOOK AT THE CAR, FOLKS! NOT HIM!", 'OUT OF THE SKY, ONTO HIM! SEE HOW HE LIKES IT!'],
  shitty: ['LAND ON HIM! SQUASH IT OUT OF HIM!', 'JUMP IT! LAND IN THE SMELL!', 'OUT OF THE SKY, ONTO HIM! SHIT YOURSELF FOR THAT ONE!'],
  nude: ['LAND ON HIM! FLATTEN THE WIENER!', 'JUMP IT! RIGHT ON THE NAKED PART!', 'OUT OF THE SKY, ONTO THE NAKED GUY! NOW WHO FELL BETTER?'],
};
/** He's getting close. */
export const STEVE_TOO_CLOSE: ByPants = {
  clean: ['TOO CLOSE! TOO CLOSE!', 'GET HIM AWAY! MY RESTRAINING ORDER IS FOR FANS!', "OUT OF MY LIGHT! THAT'S MY LIGHT!"],
  shitty: ['GET HIM AWAY! THE SMELL!', "HE'S CLOSE! I CAN TASTE IT!", "OUT OF MY LIGHT! YOU'RE STINKING UP MY SPOTLIGHT!"],
  nude: ["GET HIM AWAY! IT'S SWINGING AT ME!", 'TOO CLOSE! I CAN SEE EVERYTHING!', 'OUT OF MY SPOTLIGHT! AND TAKE THAT THING WITH YOU!'],
};
/** He's got there: Steve flails. */
export const STEVE_FLAIL: ByPants = {
  clean: ['NOT THE FACE! THE FACE IS ON THE FLIERS!', 'NOT THE HAIRPIECE!', "I'M A PROFESSIONAL! YOU'RE A GUY WHO FELL!"],
  shitty: ["DON'T TOUCH ME! YOU'RE MOIST IN THE WRONG PLACES!", 'GET YOUR SHIT OFF MY SUIT!'],
  nude: ["DON'T RUB THAT ON ME!", 'PUT IT AWAY! PUT IT AWAY!'],
};
/** A grab at him: he squirts out of it. */
export const STEVE_SLIP: ByPants = {
  clean: ['BABY OIL, BABY! FORTY YEARS OF IT!', 'NOBODY HOLDS STEVE! NOBODY UPSTAGES STEVE!', "THREE BOTTLES OF JOHNSON'S A DAY, BABY!"],
  shitty: ['NOT WITH THE BROWN HANDS! NOT THE BROWN HANDS!', 'BABY OIL BEATS WHATEVER THAT IS!'],
  nude: ['NAKED WRESTLING IS A DIFFERENT SHOW!', 'BABY OIL AND A NAKED GUY! THIS LOOKS BAD!'],
};
/** Out of there on a tow rope, dragged on his belly to the other end. */
export const STEVE_TOW: ByPants = {
  clean: ["TOW ROPE! I'M ON MY BELLY! IT'S IN THE CONTRACT!", "THE DRAG STUNT! CLAP, DAMN IT! THIS ONE'S REAL!"],
  shitty: ['TOW ME! AWAY FROM THE SMELL!', 'DRAG ME! ANYWHERE! UPWIND!'],
  nude: ['TOW ME! AWAY FROM THAT THING!', "DRAG ME! I DON'T WANNA SEE IT!"],
};
export const STEVE_HURT: ByPants = {
  clean: ["MY HIP! THAT'S MY TITANIUM HIP!", "OW! I'M FIFTY-NINE!", "THAT'S MY GOOD KNEE!", "OW! YOU DON'T EVEN HAVE A HEADSHOT!"],
  shitty: ['YOU GOT IT ON MY SUIT!', "OW! IT'S IN MY RHINESTONES!", 'OW! I BLEED, NOBODY CLAPS! YOU SHIT, THEY CLAP!'],
  nude: ['OW! SOMETHING SLAPPED ME! I HOPE IT WAS A HAND!', "DON'T HIT ME WITH THAT! IT'S WARM!", "OW! A NAKED GUY'S BEATING ME AND THEY'RE ON HIS SIDE!"],
};
/** The user's line, verbatim: the first time the lightning gets him (whatever state he's in); the rest after. */
export const STEVE_CONDUCTIVE = 'WHY DID I WEAR A CONDUCTIVE SUIT';
export const STEVE_ZAPPED: ByPants = {
  clean: ["IT'S POLYESTER! IT'S ALL POLYESTER!", 'MY FILLINGS! MY FILLINGS!', 'NOW THEY CHEER?! NOW?!', 'HE GETS A TORNADO! I GET THIS?!'],
  shitty: ["I'M FRYING! IT STILL SMELLS BETTER THAN YOU!", 'NOW I SMELL LIKE HIM! AND THEY STILL LIKE HIM BETTER!', 'NOW THEY CHEER?! NOW?!'],
  nude: ["HE'S NAKED AND I'M THE ONE GETTING ZAPPED?!", "I'M THE LIGHTNING ROD? LOOK AT HIM!", 'HE GETS A TORNADO! I GET THIS?!'],
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
  clean: ['MY OWN CAR!', "THAT'S A RENTAL! I PUT IT ON MY EX-WIFE'S CARD!", 'THAT WAS MY BIG FINISH, YOU THIEF!', 'FIRST MY CROWD! NOW MY CARS!'],
  shitty: ['MY CAR! WITH HIS HANDPRINTS ON IT!', 'HE THREW A CAR! A BROWN CAR NOW!', 'FIRST MY CROWD! NOW MY CARS! WITH SHIT ON THEM!'],
  nude: ['HE THREW A CAR AT ME! NAKED!', "HE'S GOT NO PANTS AND HE STILL TOOK EVERYTHING I GOT!"],
};
/** Under a quarter: once. */
export const STEVE_LOW: ByPants = {
  clean: ["I CAN'T FEEL MY NECK. THE BRACE IS HOLDING MY HEAD ON.", 'FORTY YEARS. NOBODY EVER CHEERED ME LIKE THAT. NOT ONCE.'],
  shitty: ["I'M GONNA DIE SMELLING THAT.", "THEY'D RATHER WATCH A GUY SHIT HIMSELF THAN WATCH ME DIE."],
  nude: ["I'M NOT DYING WITH THAT THING LOOKING AT ME.", 'NOT LIKE THIS. UPSTAGED BY A NAKED GUY.'],
};

// ---------------------------------------------------------------------------------------------------------------
// His deaths: the stunt (any way but the weakness) and the lightning rod (the spellbook's lightning)

/** Beaten: staggering out to center stage for it, to a hushed crowd. */
export const STEVE_STUMBLE: ByPants = {
  clean: ["I'M GOOD! I'M GOOD! STAY IN YOUR SEATS!", "NOBODY LEAVE! I'M FINE! THE BONE IS SUPPOSED TO STICK OUT!", 'EYES ON ME! FORGET THE TORNADO GUY! EYES ON ME!'],
  shitty: ["I'M GOOD! THAT SMELL WASN'T ME! STAY IN YOUR SEATS!", 'NOBODY LEAVE! FORGET THE GUY WHO SHAT! EYES ON ME!'],
  nude: ["I'M GOOD! THE NAKED GUY'S GONE! STAY IN YOUR SEATS!", "EYES UP HERE, FOLKS! HE'S GONE! EYES ON STEVE!"],
};
/** Beaten: one last stunt, the one he's known for. */
export const STEVE_LAST_STUNT: ByPants = {
  clean: ['LADIES AND GENTLEMEN... THE STEVE SIDESTEP!', 'LADIES AND GENTLEMEN... THE STEVE SIDESTEP! NO TORNADO! JUST TALENT!'],
  shitty: ['LADIES AND GENTLEMEN... THE STEVE SIDESTEP! HOLD YOUR NOSES!', 'LADIES AND GENTLEMEN... THE STEVE SIDESTEP! A REAL STUNT! CLEAN PANTS!'],
  nude: ["LADIES AND GENTLEMEN... THE STEVE SIDESTEP! PANTS ON! THAT'S CALLED CLASS!"],
};
/** ...and mid-step, his back goes. */
export const STEVE_BACK: ByPants = {
  clean: ['MY BACK!'],
  shitty: ['MY BACK! THIS IS YOUR FAULT!'],
  nude: ['MY BACK! STOP LOOKING!'],
};
/** Slumped over his own burning loop, his pants and then his briefs burned off him, his bare ass out for all to see:
 *  and nobody's looking at him, even now. Said once it's quiet; then he tips off it. */
export const STEVE_SLUMPED: ByPants = {
  clean: ['...IS THE JUMBOTRON GETTING THIS?', '...MY ASS IS OUT. AND NOBODY CLAPS.', '...HE FELL OUT OF THE SKY. THEY CLAPPED.'],
  shitty: ["...MY PANTS ARE ON FIRE. THEY'RE STILL TALKING ABOUT HIS.", "...SMELL THAT? THAT'S ME. FOR ONCE."],
  nude: ['...NOW WE BOTH GOT NO PANTS. LOOK AT ME.', "...MY ASS IS OUT AND THEY'RE STILL STARING AT HIS DICK."],
};
/** Fried stood there, charred, still giving the thumbs-up, while the crowd goes wild. */
export const STEVE_FRIED: ByPants = {
  clean: ["I'M... A LIGHTNING... ROD...", 'SHOULDA... WORN... THE DENIM...', "THEY'RE... CLAPPING... FOR ME..."],
  shitty: ["AT LEAST... I CAN'T SMELL YOU... ANYMORE...", "THEY'RE CLAPPING... FOR ME... FINALLY..."],
  nude: ['THE LAST THING... I SEE... IS THAT...', "FINALLY... THEY'RE LOOKING... AT ME..."],
};
export const PA_DEATH: ByPants = {
  clean: ['AND THAT WAS STUNTMAN STEVE, FOLKS. HE MISSED THE MAT. NO REFUNDS.', "STUNTMAN STEVE, FOLKS. FOOD COURT'S TO YOUR LEFT. HIS SPOT'S FOR LEASE.", "STUNTMAN STEVE, FOLKS. THAT'S HIS TWO SECONDS. BIG HAND FOR THE TORNADO GUY."],
  shitty: ['STUNTMAN STEVE, FOLKS. KILLED BY A MAN WHO SHAT HIMSELF. NO REFUNDS.', 'STUNTMAN STEVE, FOLKS. UPSTAGED BY A LOADED DIAPER, RIGHT TO THE END.'],
  nude: ['STUNTMAN STEVE, FOLKS. KILLED BY A NAKED MAN. NO REFUNDS. NO PHOTOS.', 'STUNTMAN STEVE, FOLKS. UPSTAGED BY A NAKED MAN, RIGHT TO THE END.'],
};
export const PA_DEATH_FRIED: ByPants = {
  clean: ["LADIES AND GENTLEMEN... THE HUMAN LIGHTNING ROD! HOLD YOUR APPLAUSE. HE'S DEAD.", "THE HUMAN LIGHTNING ROD, FOLKS! STEVE'S BIGGEST HAND EVER. SHAME HE'S DEAD."],
  shitty: ['THE HUMAN LIGHTNING ROD, FOLKS! THAT SMELL IS HIM. MOSTLY.', "THE HUMAN LIGHTNING ROD, FOLKS! STEVE'S BIGGEST HAND EVER. HOLD YOUR NOSES."],
  nude: ['THE HUMAN LIGHTNING ROD, FOLKS! THE NAKED MAN IS NOT PART OF THE SHOW.', "THE HUMAN LIGHTNING ROD, FOLKS! STEVE'S BIGGEST HAND EVER. NOT THE NAKED GUY'S. STEVE'S."],
};

// ---------------------------------------------------------------------------------------------------------------
// Meathead

export const MEATHEAD_WON = ['MISSED THE MAT, DUMBASS.', 'TWO SECONDS IN A MOVIE. ZERO SECONDS ALIVE.', "KEEP YOUR CROWD. I DIDN'T WANT IT."];
export const MEATHEAD_WON_WEAK = ['WEAR COTTON, DUMBASS.', 'STUNTMAN STEVE. EXTRA CRISPY.', "THERE'S YOUR STANDING OVATION."];
/** Something that isn't the book on Steve: a think out loud now and then. */
export const MEATHEAD_HINT = [
  'THAT SUIT\'S ALL ZIPPERS AND RIVETS. BET IT CONDUCTS.',
  'THE BOOK\'S GOT LIGHTNING IN IT. HE\'S GOT A METAL SUIT. HMM.',
  'SHOOT THE CARS? NAH. THE BOOK\'S GOT A ROCK FOR EVERY CAR.',
];
/** A grab at Steve (the grab's own pool for his kind: moves/grab.ts tooBig). */
export const GRAB_STEVE = ['HE\'S GREASED! HE\'S GREASED UP!', 'LIKE GRABBING A GREASED HOT DOG AT A TRUCK STOP!', 'WHAT IS HE BASTED IN?!'];
/** A grab at a car, not bulked up. */
export const GRAB_CAR = ['IT\'S A WHOLE CAR!', 'I CAN\'T LIFT A CAR! NOT LIKE THIS!', "I'D NEED A CREATINE SHAKE FOR THAT!"];

// ---------------------------------------------------------------------------------------------------------------
// What hurts him here (by source), and the death screen

export const HURT: Record<string, { hurt: string[]; death: string[] }> = {
  'm2:stunt_drift': {
    hurt: ['DRIFTED! RIGHT INTO ME!', 'TIRE MARKS ON MY ASS!', 'HE FISHTAILED MY ASS!'],
    death: ['DRIFTED INTO BY A STUNT CAR', 'TOKYO DRIFTED', 'KILLED BY A TWICE-DAILY SHOW'],
  },
  'm2:stunt_headon': {
    hurt: ['HEAD-ON! I\'M ON FIRE!', 'BUMPER TO THE BALLS!', "THAT'S MY THIRD CAR TODAY!"],
    death: ['HIT HEAD-ON BY A STUNT CAR', 'HE LOST A GAME OF CHICKEN', 'BLOWN UP BY A STUNT CAR'],
  },
  'm2:stunt_landing': {
    hurt: ['A CAR LANDED ON ME!', 'A CAR! FROM THE SKY!', 'THROUGH THE HOOP AND ONTO MY HEAD!'],
    death: ['THROUGH THE HOOP. ONTO HIM.', 'CRUSHED BY A FLYING CAR', 'STUCK THE LANDING. ON HIM.'],
  },
  'm2:stunt_wall': {
    hurt: ['RODE IT INTO THE WALL!', 'SHOULDA GOT OFF!', 'MY INSURANCE IS GONNA LOVE THIS!'],
    death: ['RODE A STUNT CAR INTO A WALL', 'ROOF RIDER. WALL WINNER.'],
  },
  'm2:steve_flail': {
    hurt: ['HE SLAPPED ME!', 'STOP FLAILING, GRANDPA!', 'HE SLAPS LIKE MY DIVORCED AUNT!'],
    death: ['SLAPPED TO DEATH BY GRANDPA', 'FLAILED TO DEATH', 'STUNTMAN STEVE\'S ONLY KILL'],
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
    ...pools(STEVE_FUMING), ...pools(STEVE_ENTRANCE), STEVE_SHOWN_UP, ...pools(STEVE_POSSE), ...pools(STEVE_TAUNT), ...pools(STEVE_SEND),
    ...pools(STEVE_RAMP), ...pools(STEVE_TOO_CLOSE), ...pools(STEVE_FLAIL), ...pools(STEVE_SLIP), ...pools(STEVE_TOW),
    ...pools(STEVE_HURT), STEVE_CONDUCTIVE, ...pools(STEVE_ZAPPED), ...pools(STEVE_PYRO), ...pools(STEVE_CAR_HIT), ...pools(STEVE_LOW),
    ...pools(STEVE_STUMBLE), ...pools(STEVE_LAST_STUNT), ...pools(STEVE_BACK), ...pools(STEVE_SLUMPED), ...pools(STEVE_FRIED),
  ],
};
