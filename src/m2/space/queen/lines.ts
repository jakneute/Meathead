// What's said in the queen section, by voice (recorded with the rest: space/voices.ts gathers these; tools/voices). In
// the user's voice (space-spec.md); pick lines with pickLine; clean / shitty / naked pools where people react to him.
//
// XENOSCARE's showpiece: THE QUEEN (LEGALLY DISTINCT), a big cheap knockoff animatronic behind glass in the hold.
// Taken over, she says nothing (screeches, clicks, hydraulics) through the fall, the basement and the disco's start;
// her first words are NOW ENTERING LESS FATAL MODE, bonked. Meathead talks the whole way. He kicks the glass; the real aliens up in
// the ride's control booth ('m2.space.alien') take her over with their mind-control rig, and she comes alive. Her voice
// is theirs, through her busted speaker ('m2.space.queen'). Every line three ways, all the same size: clean, shitty,
// naked. Never says how he got here.

import { type ByPants, all } from '../crater/lines';
export type { ByPants, Dressed } from '../crater/lines';

// ---- The cutscene

/** Up to the glass: the big finale, standing there doing nothing. */
export const MH_GLASS: ByPants = {
  clean: ["THIS IS THE BIG FINALE? SHE'S NOT EVEN MOVING.", "LEGALLY DISTINCT MY ASS. THAT'S THE THING FROM THE MOVIE.", 'HEY. WAKE UP. I CAME ALL THIS WAY.'],
  shitty: ["THIS IS THE BIG FINALE? I SHIT MYSELF FOR THIS?", "SHE'S NOT EVEN MOVING. NEITHER IS WHAT'S IN MY PANTS.", 'HEY. WAKE UP. SMELL THAT? THAT WAKES PEOPLE UP.'],
  nude: ["THIS IS THE BIG FINALE? I CAME IN HERE NAKED FOR THIS?", "SHE'S NOT EVEN MOVING. I'M NAKED. MOVE.", "HEY. WAKE UP. THERE'S A NAKED GUY AT YOUR WINDOW."],
};
/** The kick: the glass comes down. */
export const MH_KICK: ByPants = {
  clean: ['THERE. NOW YOU CAN SEE ME.', 'NO FLASH PHOTOGRAPHY. NO KICKING. MISSED THAT ONE.', "THAT'S FOR THE FIFTEEN BUCKS."],
  shitty: ['THERE. NOW YOU CAN SMELL ME.', 'NO FLASH PHOTOGRAPHY. NOTHING ABOUT SHITTING.', "THAT'S FOR THE FIFTEEN BUCKS. AND THE PANTS."],
  nude: ['THERE. NOW YOU CAN SEE ALL OF ME.', 'NO FLASH PHOTOGRAPHY. NOTHING ABOUT NAKED.', "THAT'S FOR THE FIFTEEN BUCKS. I'D TIP, BUT NO POCKETS."],
};
/** The real ones in the booth, taking her over. */
export const BOOTH_TAKEOVER: ByPants = {
  clean: [
    'YOU WANT A VIOLENT ALIEN, EARTHLING? FINE. HERE IS YOUR VIOLENT ALIEN.',
    'THIS RIDE SAYS WE ARE MONSTERS. LET US PROVE IT WRONG BY KILLING YOU WITH A MONSTER.',
    'HER BRAIN IS A COMMODORE SIXTY-FOUR. EASY. KILL HIM, YOUR MAJESTY.',
  ],
  shitty: [
    'YOU WANT A VIOLENT ALIEN, EARTHLING? HERE. SHE CANNOT SMELL.',
    'THIS RIDE SAYS WE ARE MONSTERS. YOU ARE THE ONE THAT SHIT IN IT.',
    'HER BRAIN IS A COMMODORE SIXTY-FOUR. NO NOSE. PERFECT. KILL HIM, YOUR MAJESTY.',
  ],
  nude: [
    'YOU WANT A VIOLENT ALIEN, EARTHLING? FINE. AND PUT SOMETHING ON.',
    'THIS RIDE SAYS WE ABDUCT NAKED HUMANS. NOBODY WANTS YOU.',
    'HER BRAIN IS A COMMODORE SIXTY-FOUR. THE EYES ARE PAINTED ON. LUCKY HER. KILL HIM.',
  ],
};
// ---- The fall, the basement (she says nothing down here: screeches, clicks, hydraulics; he talks)

/** Through the floor and down, landed. */
export const MH_FALL: ByPants = {
  clean: ["WELL. THAT'S A BASEMENT.", "SHE BROKE THE FLOOR. I'M SUING.", 'LANDED ON MY BALLS. GREAT.'],
  shitty: ['LANDED ON MY ASS. SQUISHED IT.', 'THAT LANDING DID NOT HELP THE PANTS.', "WELL. NOW IT'S IN MY SOCKS."],
  nude: ['LANDED ON MY BARE ASS. ON A PIPE.', 'COLD FLOOR. VERY COLD FLOOR. EVERYWHERE.', 'NAKED IN A BASEMENT. THIS IS HOW THE MOVIES START.'],
};
/** The dark, a little way in. */
export const MH_DARK = ["CAN'T SEE SHIT DOWN HERE.", "WHO TURNED OFF THE LIGHTS? HE'S NEXT.", 'SMELLS LIKE A JANITOR DIED DOWN HERE.'];
/** First sight of her, up on the pipes in front. */
export const MH_SPOT = ["OH, SHE'S UP THERE. GREAT.", 'THE ROBOT LADY IS ON THE PIPES. COOL. COOL COOL.', "THAT'S NOT FAIR. SHE CAN CLIMB."];
/** Into a locker (whispered: the cast member's stuff in there). */
export const MH_HIDE: ByPants = {
  clean: ['THIS LOCKER SMELLS LIKE FEET AND TACO BELL.', "SOMEBODY LEFT A SANDWICH IN HERE. FROM NINETY-SIX.", "THERE'S A NAME TAG. HI, BRENDA."],
  shitty: ["THIS LOCKER SMELLED FINE. IT DOESN'T NOW.", "SORRY, BRENDA. YOUR LOCKER'S RUINED.", 'SMALL SPACE. BIG MISTAKE.'],
  nude: ["SOMEBODY'S UNIFORM IN HERE. NOT PUTTING IT ON.", 'THE METAL IS COLD ON MY BALLS.', 'BRENDA WOULD NOT LIKE THIS.'],
};
/** Into a dark corner (the animatronic graveyard, behind the junk). */
export const MH_HIDE_DARK: ByPants = {
  clean: ["I'M A ROBOT. I'M A BROKEN ROBOT. DON'T LOOK.", 'HIDING BEHIND A RUBBER COW. NEW LOW.', 'NOBODY MOVE. ESPECIALLY ME.'],
  shitty: ["I'M A ROBOT. A BROKEN ROBOT THAT LEAKS.", 'HIDING BEHIND A RUBBER COW. IT SMELLS BETTER THAN ME.', "DON'T SNIFF. PLEASE DON'T SNIFF."],
  nude: ["I'M A ROBOT. A NAKED ROBOT. DON'T LOOK.", 'HIDING BEHIND A RUBBER COW. NAKED. NEW LOW.', 'NOBODY MOVE. NOTHING MOVE. NOTHING.'],
};
/** She's gone right by him. */
export const MH_PASSED = ["SHE DIDN'T SEE ME. DUMB ROBOT.", 'BLIND AS A BAT. AN UGLY BAT.', 'TOLD YOU. MASTER OF STEALTH.'];
/** She's seen him: she's coming. */
export const MH_SEEN = ['SHIT SHIT SHIT.', 'NOPE. NOPE NOPE NOPE.', 'RUN, MEATHEAD.'];
/** This life's one free loud thing: he catches himself (whispered). Firing; a charge move. */
export const MH_WARN_SHOOT = ["SHHH. JESUS. DON'T DO THAT AGAIN.", 'WAY TOO LOUD. PUT THE GUN AWAY, IDIOT.', "NO SHOOTING DOWN HERE. SHE'LL HEAR THAT."];
export const MH_WARN_MOVE = ['SHHH. QUIT STOMPING AROUND, DUMBASS.', 'EASY. NO BIG MOVES DOWN HERE.', 'QUIET, YOU MEATHEAD. SHE CAN HEAR THAT.'];
/** Shooting at her: nothing (it just brings her). */
export const MH_USELESS = ["IT DOESN'T DO ANYTHING!", 'BULLETS GO RIGHT THROUGH HER! WHAT IS SHE MADE OF?!', 'GREAT. NOW SHE HEARD THAT.'];

// ---- The disco (she speaks once she's bonked: NOW ENTERING LESS FATAL MODE)

/** The dance hall: the reveal. */
export const MH_DISCO: ByPants = {
  clean: ['A DISCO? DOWN HERE? WHO DANCES IN A BASEMENT?', 'GALACTIC GROOVE. SOUNDS LIKE A CONDOM.', 'MIRROR BALL. PERFECT. I CAN WATCH MYSELF DIE.'],
  shitty: ['A DISCO. AT LEAST IT ALREADY SMELLS LIKE ONE.', 'GALACTIC GROOVE. NOBODY IS DANCING WITH ME TONIGHT.', 'MIRROR BALL. I CAN SEE MY PANTS FROM EVERY ANGLE.'],
  nude: ['A DISCO. NAKED. FINALLY, MY ELEMENT.', 'GALACTIC GROOVE. DRESS CODE: NONE.', 'MIRROR BALL. NOW EVERYBODY CAN SEE IT.'],
};
/** Off the wall: the fire extinguisher. */
export const MH_EXTINGUISHER = ['FIRE EXTINGUISHER. EAT FOAM, BITCH.', 'THIS WORKS ON EVERYTHING.', 'STAND BACK. SCIENCE.'];
/** It didn't work. */
export const MH_FOAM_FAIL = ["SHE'S NOT ON FIRE. WHY DID I THINK THAT WOULD WORK.", "IT DIDN'T DO SHIT.", 'ALRIGHT. PLAN B.'];
/** So he throws it. */
export const MH_THROW = ['CATCH.', 'HEADS UP!', 'HERE. HAVE THE WHOLE THING.'];
/** Her first words: out of her speaker, bonked. The user's line, every time. */
export const QUEEN_LESS_FATAL: ByPants = {
  clean: ['NOW ENTERING LESS FATAL MODE.'],
  shitty: ['NOW ENTERING LESS FATAL MODE.'],
  nude: ['NOW ENTERING LESS FATAL MODE.'],
};
/** ...and him. */
export const MH_LESS_FATAL: ByPants = {
  clean: ["LESS FATAL? I'LL TAKE IT.", 'OH GOOD. ONLY MOSTLY FATAL.', 'I BROKE HER. SHE HAS A SETTING FOR THAT.'],
  shitty: ["LESS FATAL? I'M ALREADY LESS DIGNIFIED. EVEN.", 'OH GOOD. I ONLY HAVE ONE PAIR OF PANTS LEFT TO RUIN.', 'I BROKE HER. ALL IT TOOK WAS A BOTTLE.'],
  nude: ["LESS FATAL? I'LL TAKE IT. I'LL TAKE PANTS TOO.", 'OH GOOD. ONLY MOSTLY FATAL. MOSTLY NAKED TOO.', 'I BROKE HER. NAKED. WITH A BOTTLE.'],
};

// ---- The fight

/** Now and then, at him. */
export const QUEEN_TAUNT: ByPants = {
  clean: ['I AM LEGALLY DISTINCT. MY CLAWS ARE NOT.', 'I HAVE BEEN DOING THIS SHOW SINCE NINETY-FOUR. I AM SO BORED.', 'SURRENDER YOUR PLANET. OR YOUR WALLET. EITHER.', 'YOUR KIND PUT ME BEHIND GLASS. I WILL PUT YOU IN THE GROUND.'],
  shitty: ['I AM LEGALLY DISTINCT. YOUR SMELL IS NOT.', 'I HAVE NO NOSE. I CAN STILL TELL.', 'SURRENDER YOUR PLANET. AND THOSE PANTS. BURN THEM.', 'YOUR KIND PUT ME BEHIND GLASS. PUT YOURSELF IN A SHOWER.'],
  nude: ['I AM LEGALLY DISTINCT. SO IS THAT. BARELY.', 'MY EYES ARE PAINTED ON. I STILL CANNOT LOOK AWAY.', 'SURRENDER YOUR PLANET. AND COVER THAT UP.', 'YOUR KIND PUT ME BEHIND GLASS. PUT YOU BEHIND PANTS.'],
};
/** The booth, after the bonk: they beam her (the impregnator ray: a robot giving birth; don't ask). */
export const BOOTH_RAY: ByPants = {
  clean: ['ACTIVATE IMPREGNATOR RAY!', "ACTIVATE IMPREGNATOR RAY! DON'T ASK HOW!", "ACTIVATE IMPREGNATOR RAY! SHE'S A ROBOT! IT'S FINE!"],
  shitty: ['ACTIVATE IMPREGNATOR RAY! AND THE FANS!', 'ACTIVATE IMPREGNATOR RAY! BEFORE WE SUFFOCATE!', 'ACTIVATE IMPREGNATOR RAY! THE SMELL IS IN THE BOOTH!'],
  nude: ['ACTIVATE IMPREGNATOR RAY! AND DIM THE LIGHTS ON HIM!', 'ACTIVATE IMPREGNATOR RAY! NOT AT HIM! AT HER!', "ACTIVATE IMPREGNATOR RAY! DON'T POINT IT AT THE NAKED ONE!"],
};
/** The booth, cheering a birth. */
export const BOOTH_BIRTH: ByPants = {
  clean: ["IT'S A BOY!", 'WELCOME TO EARTH, SON! KILL!', 'THAT ONE HAS MY JAW!'],
  shitty: ["IT'S A BOY! HE'S CLEANER THAN THAT GUY!", 'GO, SON! HOLD YOUR BREATH!', 'THAT ONE HAS MY NOSE! POOR KID!'],
  nude: ["IT'S A BOY! COVER HIS EYES!", "GO, SON! DON'T LOOK AT IT!", "THAT ONE'S DRESSED BETTER THAN HIM!"],
};
/** Him: the ray; the births; batting one back into her; bonking her head. */
export const MH_RAY = ["AN IMPREGNATOR RAY? ON A ROBOT? I'M NOT ASKING.", "I'M NOT GONNA ASK. I'M NOT GONNA ASK.", "OKAY. I'M NOT WATCHING THIS PART."];
export const MH_BIRTH = ['SHE JUST SHIT OUT A ROBOT.', "THAT'S NOT WHERE BABIES COME FROM. I THINK.", 'OH GOD. IT CAME OUT HER ASS.'];
export const MH_BAT = ['RETURN TO SENDER!', 'BACK WHERE YOU CAME FROM! THE ASS!', "HERE'S YOUR KID BACK, LADY!"];
export const MH_HEAD = ['BONK.', 'RIGHT IN THE CRANIUM.', 'TAKE A SEAT. THE OTHER SIDE.'];

/** Pushing one out (her back to him). */
export const QUEEN_BIRTH: ByPants = {
  clean: ['PUSHING.', 'NEW EMPLOYEE ORIENTATION. NOW.', "IT'S A BOY. IT'S A ROBOT. KILL HIM, SON."],
  shitty: ['I AM NOT THE ONLY ONE HERE WHO PUSHED SOMETHING OUT TODAY.', 'PUSHING. YOU KNOW ALL ABOUT PUSHING.', "IT'S A BOY. HE SMELLS BETTER THAN YOU."],
  nude: ['PUSHING. DO NOT WATCH.', 'LOOK AWAY. ...YOU NEVER LOOK AWAY.', "IT'S A BOY. HE IS WEARING MORE THAN YOU."],
};
/** Over to the other side, barfing motor oil on the way. */
export const QUEEN_LEAP: ByPants = {
  clean: ['RELOCATING. HAVE SOME MOTOR OIL.', 'ACID. IT IS MOTOR OIL. SAME THING.', 'TOP OFF YOUR FLUIDS.'],
  shitty: ['MOTOR OIL. IT WILL BLEND IN.', 'ACID. YOUR PANTS WILL NOT NOTICE.', 'TOP OFF YOUR FLUIDS. YOU LOST SOME.'],
  nude: ['MOTOR OIL. FINALLY, SOMETHING TO COVER YOU.', 'OIL. YOU ARE ALREADY DRESSED FOR IT.', 'TOP OFF YOUR FLUIDS. DO NOT RUB IT IN.'],
};
/** Stunned (her own batted back into her; her head bonked). */
export const QUEEN_STUN: ByPants = {
  clean: ['ERROR. ERROR. THAT WAS MY SON.', 'SYSTEM REBOOT. OW.', 'LESS FATAL MODE... LESS... OW.'],
  shitty: ['ERROR. YOU THREW MY SON. WITH THOSE HANDS.', 'SYSTEM REBOOT. AND DISINFECT.', 'OW. AND EW.'],
  nude: ['ERROR. NAKED BATTING PRACTICE DETECTED.', 'SYSTEM REBOOT. EYES REBOOT.', 'OW. AND PUT THAT AWAY.'],
};
/** Him in her face too long: the flail. */
export const QUEEN_FLAIL: ByPants = {
  clean: ['PERSONAL SPACE VIOLATION.', 'BACK UP. BACK UP. BACK UP.', 'ARMS. ALL OF THEM.'],
  shitty: ['TOO CLOSE. TOO SMELLY.', 'BACK UP. AIR OUT.', 'ARMS. ALL OF THEM. AWAY FROM THAT.'],
  nude: ['TOO CLOSE. TOO NAKED.', 'BACK UP. AND TUCK IT.', 'ARMS. ALL OF THEM. NOT TOUCHING THAT.'],
};
/** Beaten: her circuits going, and their voices out of her (then the feedback gets them). */
export const QUEEN_DIES: ByPants = {
  clean: ['THANK YOU... FOR VISITING... XENOSCARE... EXIT THROUGH... THE GIFT... SHOP...', 'ANY RESEMBLANCE... IS PURELY... COINCIDENTAL...', 'WE ARE... A PEACEFUL... PEOPLE... BZZT...'],
  shitty: ['THANK YOU... FOR VISITING... XENOSCARE... PLEASE... SHOWER...', 'ANY RESEMBLANCE... TO A CLEAN MAN... IS PURELY... COINCIDENTAL...', 'WE ARE... A PEACEFUL... PEOPLE... YOU... STINK... BZZT...'],
  nude: ['THANK YOU... FOR VISITING... XENOSCARE... PLEASE... GET DRESSED...', 'ANY RESEMBLANCE... TO A DRESSED MAN... IS PURELY... COINCIDENTAL...', 'WE ARE... A PEACEFUL... PEOPLE... PUT IT... AWAY... BZZT...'],
};
/** Him, after. */
export const MH_WON: ByPants = {
  clean: ['GAME OVER, YOUR MAJESTY.', 'LEGALLY DISTINCT. LEGALLY DEAD.', 'BOO, BITCH.'],
  shitty: ['GAME OVER. AND I STILL NEED A BATHROOM.', 'BEST RIDE IN THE PARK. SECOND BEST SMELL.', 'BOO, BITCH. NOW WHERE ARE THE TOILETS.'],
  nude: ['GAME OVER. SOMEBODY GET ME A ROBE.', 'BEST RIDE IN THE PARK. FELT GREAT ON THE BALLS.', 'BOO, BITCH. I WIN NAKED.'],
};

// ---- What he says when hers hurt him, and the death screen

export const HURT_OIL = ['MOTOR OIL! IN MY EYES!', 'SHE BARFED A QUART OF OIL ON ME!', "IT'S HOT! WHY IS IT HOT?!"];
export const DEATH_OIL = ['DROWNED IN MOTOR OIL', 'LUBED TO DEATH', 'OIL CHANGED'];
/** Her flail (him in her face too long), and the oil pool round her after a leap: by the state of him. */
export const HURT_FLAIL: ByPants = {
  clean: ['ALL FOUR ARMS! AT ONCE!', 'SHE SLAPPED ME INTO NEXT WEEK!', 'OKAY! I GET IT! PERSONAL SPACE!'],
  shitty: ['ALL FOUR ARMS! RIGHT IN THE PANTS!', 'SHE SLAPPED IT OUT OF ME! MORE OF IT!', 'OKAY! I GET IT! I SMELL!'],
  nude: ['ALL FOUR ARMS! ON MY BARE ASS!', 'SHE SLAPPED ME EVERYWHERE! EVERYWHERE!', 'OKAY! I GET IT! IT FLOPS!'],
};
export const DEATH_FLAIL: ByPants = {
  clean: ['FLAILED TO DEATH', 'SLAPPED SILLY', 'TOO CLOSE TO THE QUEEN'],
  shitty: ['SLAPPED THE SHIT OUT OF', 'FLAILED TO DEATH', 'SPANKED'],
  nude: ['SPANKED TO DEATH', 'SLAPPED SILLY. NAKED.', 'TOO CLOSE TO THE QUEEN'],
};
export const HURT_POOL: ByPants = {
  clean: ["HOT OIL! I'M STANDING IN HOT OIL!", 'MY FEET! IT BURNS MY FEET!', 'IT EATS THROUGH SHOES! WHAT KIND OF OIL IS THIS?!'],
  shitty: ['HOT OIL! IT GOT IN THE PANTS!', 'IT BURNS! AND NOW THE PANTS ARE GREASY TOO!', "IT'S MIXING WITH THE OTHER THING!"],
  nude: ['HOT OIL! ON MY BARE EVERYTHING!', 'IT BURNS MY BALLS!', 'NAKED IN HOT OIL! THIS IS A FRYER!'],
};
export const DEATH_POOL: ByPants = {
  clean: ['DEEP FRIED', 'BOILED IN MOTOR OIL', 'AN OIL CHANGE GONE WRONG'],
  shitty: ['DEEP FRIED, PANTS AND ALL', 'BOILED IN MOTOR OIL', 'GREASE FIRE'],
  nude: ['DEEP FRIED. NAKED.', 'BOILED IN MOTOR OIL. ALL OF HIM.', 'CRISPY'],
};
export const HURT_BITER = ['THE BABY BIT MY ANKLE!', 'GET OFF MY SHIN, YOU ROBOT TURD!', "IT'S A TODDLER WITH TEETH!"];
export const DEATH_BITER = ['EATEN BY A NEWBORN', 'ANKLE-BITTEN', 'TODDLED TO DEATH'];
export const HURT_SPITTER = ['THE SPITTY ONE SHOVED ME!', 'GET YOUR TAILPIPE OUT OF MY FACE!', 'OW! THE MIDDLE KID!'];
export const DEATH_SPITTER = ['MUGGED BY A MIDDLE CHILD', 'SHOVED', 'KILLED BY THE FAMILY'];
export const HURT_CHARGER = ['THE BIG BABY RAN ME OVER!', 'THAT KID HITS LIKE A TRUCK!', 'WHO RAISED YOU?! OH. HER.'];
export const DEATH_CHARGER = ['RUN DOWN BY A BABY', 'BULLDOZED', 'KILLED BY A DAYCARE'];
export const HURT_JAW = ['HER MOUTH HAS A MOUTH!', 'THE JAW! THE LITTLE JAW!', 'AAAGH! RIGHT IN THE FOREHEAD!'];
export const DEATH_JAW = ['SECOND MOUTH TO THE FACE', 'JAWED', 'LEGALLY DISTINCT DEATH'];
export const HURT_SPIT = ['HOT OIL! THE KID SPIT HOT OIL!', "IT'S IN MY MOUTH! IT TASTES LIKE A CAR!", 'SPIT ON BY A BABY! RUDE!'];
export const DEATH_SPIT = ['SPAT TO DEATH', 'GREASED', 'KILLED BY A SPITTER'];

export const VOICE_LINES: Record<string, string[]> = {
  meathead: [
    ...all(MH_GLASS), ...all(MH_KICK), ...all(MH_FALL), ...MH_DARK, ...MH_SPOT, ...all(MH_HIDE), ...all(MH_HIDE_DARK), ...MH_PASSED, ...MH_SEEN, ...MH_WARN_SHOOT, ...MH_WARN_MOVE, ...MH_USELESS,
    ...all(MH_DISCO), ...MH_EXTINGUISHER, ...MH_FOAM_FAIL, ...MH_THROW, ...all(MH_LESS_FATAL), ...MH_RAY, ...MH_BIRTH, ...MH_BAT, ...MH_HEAD, ...all(MH_WON),
    ...HURT_SPIT, ...HURT_JAW, ...HURT_OIL, ...all(HURT_FLAIL), ...all(HURT_POOL), ...HURT_BITER, ...HURT_SPITTER, ...HURT_CHARGER,
  ],
  death: [...DEATH_SPIT, ...DEATH_JAW, ...DEATH_OIL, ...all(DEATH_FLAIL), ...all(DEATH_POOL), ...DEATH_BITER, ...DEATH_SPITTER, ...DEATH_CHARGER],
  'm2.space.alien': [...all(BOOTH_TAKEOVER), ...all(BOOTH_RAY), ...all(BOOTH_BIRTH)],
  'm2.space.queen': ['NOW ENTERING LESS FATAL MODE.', ...[QUEEN_TAUNT, QUEEN_BIRTH, QUEEN_LEAP, QUEEN_STUN, QUEEN_FLAIL, QUEEN_DIES].flatMap(all)],
};
