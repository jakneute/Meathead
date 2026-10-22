// The demon's fight, said (lines.ts gathers these into hell's VOICE_LINES): his own lines under 'm2.demon', Meathead's
// about him under 'meathead', the death screen's under 'death'. BRATHAZAR, Satan's boy: a big punk demon kid, eager,
// try-hard, forever checking whether his dad's watching; whiny the second it goes wrong. Every group of his three ways
// (the same size each), by the state of Meathead's pants.

import type { ByPants } from './lines';

export const DEMON_NAME = 'BRATHAZAR';

/** Walking in on him (shredding on his guitar, for nobody). */
export const DEMON_INTRO: ByPants = {
  clean: ['DAD! DAD, A MORTAL! WATCH ME KILL HIM!', 'DAD, PUT DOWN THE PHONE. WATCH THIS.', 'YOU ARE GONNA MAKE MY DAD SO PROUD, NERD.'],
  shitty: ["DAD! HE SHIT HIMSELF ALREADY! THAT'S 'CAUSE OF ME!", 'DAD, LOOK! HE SHAT JUST LOOKING AT ME!', 'HE SHAT. I DID THAT. DAD, WRITE THAT DOWN.'],
  nude: ["DAD! A NAKED GUY! CAN I KILL HIM? I'M KILLING HIM.", 'DAD, LOOK! I SCARED HIS CLOTHES OFF!', 'NICE DICK, LOSER. DAD, WATCH THIS.'],
};
/** Through the fight: showing off for his dad (who isn't looking). */
export const DEMON_CHATTER: ByPants = {
  clean: ['DAD! DAD, ARE YOU WATCHING?!', 'DAD! DID YOU SEE THAT ONE?! DAD!', "MY DAD'S THE DEVIL. WHAT'S YOUR DAD, A DENTIST?", "THIS IS FOR EVERY TIME DAD CALLED ME SOFT!"],
  shitty: ['DAD! WATCH ME KILL THE SHITTY GUY!', "DAD, HE SMELLS LIKE THE SEVENTH CIRCLE! THE TOILET ONE!", 'DAD! DAD! LOOK AT ME KILL THE POOP GUY!', 'QUIT DRIPPING! I GOT DAD WATCHING!'],
  nude: ["DAD! ARE YOU WATCHING?! NOT HIS DICK! ME!", "DAD, I'M FIGHTING A NAKED GUY! THAT'S HARDCORE!", "QUIT SWINGING THAT THING! I'M TRYING TO IMPRESS MY DAD!", "DAD! I'M GONNA KILL HIM AND I WON'T EVEN LOOK DOWN!"],
};
/** He's got him: showing off. */
export const DEMON_HIT: ByPants = {
  clean: ['DAD! DID YOU SEE THAT?! I GOT HIM!', "THAT'S PUNK ROCK, BITCH!", "HELL YEAH! DAD, THAT ONE'S GOING ON THE FRIDGE!", 'STAY DOWN, NERD!'],
  shitty: ['DAD! I HIT HIM SO HARD HE SHIT MORE!', "GOT HIM! UGH, IT'S ON MY GUITAR!", "HELL YEAH! THERE'S SHIT ON MY BOOTS, BUT HELL YEAH!", 'STAY DOWN, SHIT-NERD!'],
  nude: ['DAD! I HIT THE NAKED GUY!', 'GOT HIM! RIGHT IN THE NAKED!', "HELL YEAH! DAD, DON'T ZOOM IN!", 'STAY DOWN, NUDIST!'],
};
/** Hurt enough to stagger: whining. */
export const DEMON_HURT: ByPants = {
  clean: ["OW! DAD! THAT ONE DOESN'T COUNT!", "OW! I WASN'T READY! DAD, I WASN'T READY!", "DAD, DON'T LOOK! DON'T LOOK!", 'OW! MY SPIKES! YOU KNOW HOW LONG THESE TAKE?!'],
  shitty: ['OW! HE GOT SHIT ON MY JACKET! DAD!', 'DAD! HE HIT ME WITH HIS SHITTY HANDS!', "OW! THAT'S A VINTAGE JACKET AND NOW IT'S GOT SHIT ON IT!", "DAD, DON'T LOOK! I'M CRYING AND HE STINKS!"],
  nude: ['OW! HIS WIENER TOUCHED MY JACKET! DAD!', "DAD! A NAKED GUY HIT ME! THAT'S NOT ALLOWED!", "DON'T LOOK, DAD! I'M LOSING TO A NAKED GUY!", 'OW! MY SPIKES! AND I SAW HIS BALLS!'],
};
/** The fake-out (a jump that isn't): laughing at him for flinching. */
export const DEMON_FEINT: ByPants = {
  clean: ['HA! FLINCHED!', 'MADE YOU JUMP, NERD!', 'DAD, HE FLINCHED! DID YOU SEE?!'],
  shitty: ['HA! FLINCHED! AND SHAT!', 'MADE YOU SHIT AGAIN!', 'DAD, HE FLINCHED! I THINK MORE CAME OUT!'],
  nude: ['HA! FLINCHED! IT JIGGLED!', 'MADE YOU JUMP! PUT THAT AWAY!', 'DAD, HE FLINCHED! EVERYTHING FLINCHED!'],
};
/** Beaten: off crying to his dad (he doesn't die, he tattles). */
export const DEMON_BEATEN: ByPants = {
  clean: ["DAAAAAD! THE MORTAL'S HITTING ME! MAKE HIM STOP!", 'FUCK THIS. DAAAAAD! HE CHEATED! HE USED GUNS!'],
  shitty: ["DAAAAAD! THE SHITTY MORTAL'S HITTING ME!", 'FUCK THIS. DAAAAAD! HE GOT SHIT IN MY MOHAWK!'],
  nude: ['DAAAAAD! A NAKED GUY BEAT ME UP! MAKE HIM STOP!', 'FUCK THIS. DAAAAAD! HE BEAT ME UP WITH HIS DICK OUT!'],
};

// ---------------------------------------------------------------------------------------------------------------
// Meathead, about him

/** Walking in on him. */
export const MH_DEMON = ["THE DEVIL'S KID IS A MALL PUNK.", 'NICE HAIR, HOT TOPIC.', 'GREAT. A DEMON WITH A GUITAR.'];
/** Him off crying to his dad. */
export const MH_LEAVES = ['DID HE JUST CALL HIS DAD?', 'YEAH! RUN TO DADDY, SID VICIOUS!', "THE DEVIL'S KID TATTLED ON ME."];
/** Bounced off him again (a shoulder into him's like a shoulder into a truck): said in order, a couple of times. */
export const MH_BOUNCE = ["OW. HE'S BUILT LIKE A BRICK SHITHOUSE.", 'QUIT RUNNING INTO HIM, DUMBASS. SHOOT HIM.'];

// What he says when these hurt him (the death screen's when they kill him).
/** The guitar: the sweep, the combo. */
export const HURT_GUITAR = ['HE HIT ME WITH A GUITAR!', 'THAT GUITAR HAS SPIKES ON IT!', 'HE PLAYED MY TEETH!', 'OW! ROCK AND ROLL!'];
export const DEATH_GUITAR = ['SMASHED LIKE A GUITAR', 'ENCORE', 'ROCKED'];
/** Landed on by his leap. */
export const HURT_CRUSH = ['HE LANDED ON ME!', 'GET YOUR BOOTS OFF MY FACE!', 'STOMPED BY A MALL PUNK!'];
export const DEATH_CRUSH = ['MOSH PIT CASUALTY', 'CURB STOMPED', 'STAGE DIVED ON'];
/** The shockwave off his landing, along the floor. */
export const HURT_WAVE = ['THE FLOOR KICKED ME!', 'MY KNEES!', 'WHAT WAS THAT, A BASS DROP?!'];
export const DEATH_WAVE = ['SHOCKWAVED', 'FLOORED', 'DROPPED THE BASS'];
/** His head-down rush, horns first. */
export const HURT_RUSH = ['HE HORNED ME IN THE GUT!', 'HE RAN ME OVER!', "HE'S A BULL! A STUPID PUNK BULL!"];
export const DEATH_RUSH = ['GORED', 'RUN DOWN', 'BULLDOZED BY A PUNK'];
/** The hellfire pillars where he points. */
export const HURT_PILLAR = ['FIRE CAME OUT OF THE FLOOR!', 'MY ASS IS ON FIRE!', 'HE POINTED AND IT WAS FIRE!'];
export const DEATH_PILLAR = ['HELLFIRED', 'POINTED AT', 'ERUPTED'];
/** His fire breath. */
export const HURT_BREATH = ['HIS BREATH IS ON FIRE!', 'BRUSH YOUR TEETH, ASSHOLE!', 'HE BURPED FIRE ON ME!'];
export const DEATH_BREATH = ['HALITOSIS', 'FLAME-BROILED BY A BRAT', 'BREATHED ON'];
/** Bumped into him while he's up in the air on a leap. */
export const HURT_AIRBODY = ['HE BODY-CHECKED ME IN MID-AIR!', 'HE STAGE DIVED INTO ME!', 'GET OFF ME, YOU POSER!'];
export const DEATH_AIRBODY = ['SWATTED OUT OF THE AIR', 'AIRBALLED', 'CROWD-SURFED ON'];
/** Charged him, bounced off, and back into the wall of fire. */
export const HURT_BOUNCE_FIRE = ['HE BOUNCED ME INTO THE FIRE!', "IT'S LIKE HITTING A WALL! A WALL NEXT TO FIRE!", 'BOING! OW! FIRE!'];
export const DEATH_BOUNCE_FIRE = ['REBOUNDED INTO HELLFIRE', 'BOUNCED AND BARBECUED', 'PINBALLED'];
/** Just walked into him (a shove). */
export const HURT_BUMP = ['HE SHOVED ME!', 'WATCH IT, POSER!', 'HE ELBOWED ME!'];
export const DEATH_BUMP = ['MOSHED', 'SHOVED TO DEATH', 'ELBOWED OUT'];

const all = (r: ByPants) => [...r.clean, ...r.shitty, ...r.nude];
export const DEMON_VOICE_LINES: Record<string, string[]> = {
  meathead: [
    ...MH_DEMON, ...MH_LEAVES, ...MH_BOUNCE,
    ...HURT_GUITAR, ...HURT_CRUSH, ...HURT_WAVE, ...HURT_RUSH, ...HURT_PILLAR, ...HURT_BREATH, ...HURT_AIRBODY, ...HURT_BOUNCE_FIRE, ...HURT_BUMP,
  ],
  death: [...DEATH_GUITAR, ...DEATH_CRUSH, ...DEATH_WAVE, ...DEATH_RUSH, ...DEATH_PILLAR, ...DEATH_BREATH, ...DEATH_AIRBODY, ...DEATH_BOUNCE_FIRE, ...DEATH_BUMP],
  'm2.demon': [...all(DEMON_INTRO), ...all(DEMON_CHATTER), ...all(DEMON_HIT), ...all(DEMON_HURT), ...all(DEMON_FEINT), ...all(DEMON_BEATEN)],
};
