// What's said in the queen section, by voice (recorded with the rest: space/voices.ts gathers these; tools/voices). In
// the user's voice (space-spec.md); pick lines with pickLine; clean / shitty / naked pools where people react to him.
//
// XENOSCARE's showpiece: THE QUEEN (LEGALLY DISTINCT), a big cheap knockoff animatronic behind glass in the hold. He kicks the glass; the real aliens up in
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
/** She comes alive (the aliens' words out of her speaker). */
export const QUEEN_INTRO: ByPants = {
  clean: ['I. AM. THE QUEEN. LEGALLY DISTINCT. LETHALLY THE SAME.', 'I WAS ON A TIMER. NOW I AM ON MURDER.', 'BOO. ...NO. THIS TIME. FOR REAL. BOO.'],
  shitty: ['I. AM. THE QUEEN. LEGALLY DISTINCT. AND YOU. ARE. DISGUSTING.', 'BOW TO THE HIVE. NO. STAY BACK. DIE FROM OVER THERE.', 'BOO. ...YOU WERE ALREADY SCARED. I CAN TELL.'],
  nude: ['I. AM. THE QUEEN. LEGALLY DISTINCT. AND YOU ARE. NAKED. IN MY HOLD.', 'BOW TO THE HIVE. NO. DO NOT BEND OVER.', 'BOO. ...WHY ARE YOU NOT WEARING ANYTHING.'],
};

// ---- The fight

/** Now and then, at him. */
export const QUEEN_TAUNT: ByPants = {
  clean: ['I AM LEGALLY DISTINCT. MY CLAWS ARE NOT.', 'I HAVE BEEN DOING THIS SHOW SINCE NINETY-FOUR. I AM SO BORED.', 'SURRENDER YOUR PLANET. OR YOUR WALLET. EITHER.', 'YOUR KIND PUT ME BEHIND GLASS. I WILL PUT YOU IN THE GROUND.'],
  shitty: ['I AM LEGALLY DISTINCT. YOUR SMELL IS NOT.', 'I HAVE NO NOSE. I CAN STILL TELL.', 'SURRENDER YOUR PLANET. AND THOSE PANTS. BURN THEM.', 'YOUR KIND PUT ME BEHIND GLASS. PUT YOURSELF IN A SHOWER.'],
  nude: ['I AM LEGALLY DISTINCT. SO IS THAT. BARELY.', 'MY EYES ARE PAINTED ON. I STILL CANNOT LOOK AWAY.', 'SURRENDER YOUR PLANET. AND COVER THAT UP.', 'YOUR KIND PUT ME BEHIND GLASS. PUT YOU BEHIND PANTS.'],
};
/** Winding up a swipe. */
export const QUEEN_SWIPE: ByPants = {
  clean: ['COME HERE.', 'HOLD STILL, MEAT.', 'CLAWS. REAL ONES. WELL. FIBERGLASS.'],
  shitty: ['COME HERE. NO. YES. COME HERE.', 'HOLD STILL, STINKY.', 'CLAWS. I WILL WASH THEM AFTER.'],
  nude: ['COME HERE. NOT THAT CLOSE.', 'HOLD STILL, NAKED MEAT.', 'CLAWS. AIMING HIGH. VERY HIGH.'],
};
/** Spitting. */
export const QUEEN_SPIT: ByPants = {
  clean: ['ACID. FROM THE DRINKING FOUNTAIN.', 'SAY AHH.', 'HAVE SOME HYDRAULIC FLUID.'],
  shitty: ['ACID. TO CLEAN YOU.', 'SAY AHH. THEN SAY SORRY.', 'HAVE SOME FLUID. YOU NEED A RINSE.'],
  nude: ['ACID. AIMED AT YOUR FACE. ONLY THE FACE.', 'SAY AHH. AND STOP WIGGLING THAT.', 'HAVE SOME FLUID. IT IS WARM. SORRY.'],
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

export const HURT_CLAW = ['SHE CLAWED ME! THE ROBOT LADY CLAWED ME!', 'FIBERGLASS NAILS! IN MY FACE!', 'THAT THING CAME OFF ITS STAND!'];
export const DEATH_CLAW = ['CLAWED BY A PROP', 'SWIPED', 'KILLED BY THE FINALE'];
export const HURT_SPIT = ['ACID! IT BURNS MY ASS!', "IT'S HYDRAULIC FLUID! IN MY MOUTH!", 'SHE SPIT ON ME! RUDE!'];
export const DEATH_SPIT = ['DISSOLVED', 'SPAT TO DEATH', 'MELTED BY A RIDE'];

export const VOICE_LINES: Record<string, string[]> = {
  meathead: [...all(MH_GLASS), ...all(MH_KICK), ...all(MH_WON), ...HURT_CLAW, ...HURT_SPIT],
  death: [...DEATH_CLAW, ...DEATH_SPIT],
  'm2.space.alien': [...all(BOOTH_TAKEOVER)],
  'm2.space.queen': [...[QUEEN_INTRO, QUEEN_TAUNT, QUEEN_SWIPE, QUEEN_SPIT, QUEEN_DIES].flatMap(all)],
};
