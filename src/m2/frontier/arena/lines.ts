// What's said in the catch-up and Tucker's arena, by voice (frontier/voices.ts gathers it; tools/voices records it). In
// the user's voice: blunt, short, vulgar, specific; talk less; fit the trigger. Picked with pickLine. Every group in
// clean / shitty / naked pools (Tucker's, and Meathead's: they react to the state of him). Pure data (tools/voices
// bundles it in node). His fight's own lines go here when it's designed.

import { allOf, TUCKER_VOICE, type ByPants } from '../talk';

// ---------------------------------------------------------------------------------------------------------------
// The catch-up (the user's: "you took them all out?", he can't stand people cutting the line expecting a free ride, he
// doesn't give handouts; the tree, the branch)

/** His bike coughed out; Meathead pulls up behind him (the user's line, verbatim in all three; a kicker on the other two). */
export const TUCKER_CAUGHT: ByPants = {
  clean: ['YOU TOOK THEM ALL OUT?'],
  shitty: ['YOU TOOK THEM ALL OUT? SMELLING LIKE THAT?'],
  nude: ['YOU TOOK THEM ALL OUT? WITH YOUR WHOLE THING OUT?'],
};
/** Furious: the line-cutter. */
export const TUCKER_RANT: ByPants = {
  clean: [
    'YOU CUT MY LINE! YOU RODE MY TRAIN! YOU RODE MY LOG! ALL FREE!',
    'EVERYBODY WAITS! EVERYBODY PAYS! YOU JUST WALK TO THE FRONT!',
  ],
  shitty: [
    'YOU CUT MY LINE! YOU RODE MY LOG FOR FREE! AND YOU SHAT IN IT!',
    'EVERYBODY WAITS! EVERYBODY PAYS! NOBODY CRAPS ON MY SEATS FOR FREE!',
  ],
  nude: [
    'YOU CUT MY LINE! YOU RODE EVERYTHING I OWN! FREE! AND BARE-ASSED!',
    'EVERYBODY PAYS! WHERE\'S YOUR WALLET?! WHERE WOULD IT EVEN GO?!',
  ],
};
/** Meathead's say, in between. */
export const MH_CAUGHT: ByPants = {
  clean: ['YOU OWE ME TWENTY BUCKS.', 'THEY HAD IT COMING. SO DO YOU.'],
  shitty: ['I SHIT MYSELF OVER THIS. PAY UP.', 'YEAH. AND I SMELL LIKE A WINNER.'],
  nude: ['I GOT NAKED OVER THIS. PAY UP.', 'YEAH. AND I DID IT WITH MY DICK OUT.'],
};
/** Furious: no handouts (the user's words in every line). */
export const TUCKER_HANDOUT: ByPants = {
  clean: [
    'I DON\'T GIVE HANDOUTS! ONE FARE! PLUS INTEREST!',
    'NOBODY RIDES FREE! I DON\'T GIVE HANDOUTS!',
  ],
  shitty: [
    'I DON\'T GIVE HANDOUTS! AND I DON\'T TAKE SHIT! I\'M LOOKING AT IT!',
    'NOBODY RIDES FREE! I DON\'T GIVE HANDOUTS! OR WET WIPES!',
  ],
  nude: [
    'I DON\'T GIVE HANDOUTS! KEEP YOURS WHERE I CAN SEE THEM! NOT THERE!',
    'NOBODY RIDES FREE! I DON\'T GIVE HANDOUTS! OR PANTS!',
  ],
};
/** Back on the bike, revving, before he guns it off to get a run at him. */
export const TUCKER_GUN: ByPants = {
  clean: ['STAY RIGHT THERE! I\'M RUNNING YOU OVER! NO CHARGE!', 'HOLD STILL! THIS ONE\'S ON THE HOUSE!'],
  shitty: ['STAY RIGHT THERE! I\'M RUNNING YOU OVER! TIRES ARE CHEAPER THAN SOAP!', 'HOLD STILL! THIS ONE\'S ON THE HOUSE! HOLD YOUR BOWELS TOO!'],
  nude: ['STAY RIGHT THERE! I\'M RUNNING YOU OVER! ALL OF YOU!', 'HOLD STILL! THIS ONE\'S ON THE HOUSE! AIM FOR THE LITTLE ONE!'],
};
/** His last words, on the branch (the close-up's end). */
export const TUCKER_SKEWERED: ByPants = {
  clean: ['PUT IT... ON MY TAB...', 'I\'VE BEEN... OVERCHARGED...'],
  shitty: ['AT LEAST... I CAN\'T SMELL YOU... ANYMORE...', 'PUT IT... ON HIS TAB... THE STINKY ONE...'],
  nude: ['AT LEAST... I CAN\'T SEE... YOUR THING... ANYMORE...', 'PUT IT... ON HIS TAB... THE NAKED ONE...'],
};
/** Meathead, pulled up under him, him hung on the oak. */
export const MH_SKEWERED: ByPants = {
  clean: ['SHISH KEBAB.', 'TREE ONE. TUCKER ZERO.'],
  shitty: ['AND I THOUGHT MY DAY WAS SHITTY.', 'HE GOT TREED. I GOT SHAT.'],
  nude: ['AND I THOUGHT I WAS EXPOSED.', 'HE\'S GOT WOOD. I\'VE GOT NOTHING ON.'],
};

// ---------------------------------------------------------------------------------------------------------------
// The fake-out (the user's: he walks up to the body; "are you going to fake me out again?"; yep: the jumpscare)

/** Walked up to the body (the user's line, verbatim in all three; a kicker on the other two). */
export const FAKE_ME_OUT: ByPants = {
  clean: ['ARE YOU GOING TO FAKE ME OUT AGAIN?'],
  shitty: ['ARE YOU GOING TO FAKE ME OUT AGAIN? I\'VE GOT NOTHING LEFT TO SHIT.'],
  nude: ['ARE YOU GOING TO FAKE ME OUT AGAIN? I\'M NAKED. I SCARE EASY.'],
};
/** Yep: off the branch at him, the jumpscare. */
export const TUCKER_JUMP: ByPants = {
  clean: ['AAAHHH!', 'AAAAAHHHHH!'],
  shitty: ['AAAHHH! PEE-YEW!', 'AAAAAHHHHH!'],
  nude: ['AAAHHH! PUT IT AWAY!', 'AAAAAHHHHH!'],
};
/** Meathead, jumped out of his skin. */
export const MH_JUMPED: ByPants = {
  clean: ['YEP. THERE IT IS.', 'EVERY. SINGLE. TIME.'],
  shitty: ['YEP. THERE GOES ANOTHER LOAD.', 'EVERY TIME. MY PANTS CAN\'T TAKE THIS.'],
  nude: ['YEP. GOOD THING I\'M NOT WEARING PANTS.', 'EVERY TIME. EVERYTHING JUST SHRANK.'],
};
/** On his feet, the branch through him, squaring up (the fight starts here). */
export const TUCKER_UP: ByPants = {
  clean: ['NOW! ABOUT THAT FARE!', 'ONE FARE! PLUS INTEREST! PLUS ONE TREE!'],
  shitty: ['NOW! ABOUT THAT FARE! PLUS THE CLEANING FEE!', 'ONE FARE! PLUS INTEREST! PLUS NEW SEATS FOR THE LOG!'],
  nude: ['NOW! ABOUT THAT FARE! PLUS A DECENCY FINE!', 'ONE FARE! PLUS INTEREST! PLUS THERAPY FOR THOSE CHILDREN!'],
};
/** A retry: he pops up again off the ground by the felled tree (the entrance beat), split and blind. */
export const TUCKER_ENTRANCE: ByPants = {
  clean: ['AAAHHH! WHERE\'D YOU GO?! YOU STILL OWE ME!', 'BOO! ...WAS THAT YOU? YOU STILL OWE ME!'],
  shitty: ['AAAHHH! DON\'T NEED EYES! I CAN SMELL YOU!', 'BOO! I CAN\'T SEE YOU! I CAN SURE SMELL YOU!'],
  nude: ['AAAHHH! STILL NAKED? I\'LL TAKE YOUR WORD FOR IT!', 'BOO! BEST PART OF BLIND! NO MORE OF YOUR THING!'],
};

// ---------------------------------------------------------------------------------------------------------------
// The arena entry (the user's: he runs off to the right taunting him to fight him, man to man; a tree with a lumberjack
// axe in it; one swing, the tree comes down on his head, the saw driven down, his face split to the nose; then the
// fight). Blind from here on.

/** Run off past the axe tree, turned round: man to man. */
export const TUCKER_TAUNT: ByPants = {
  clean: [
    'COME ON! MAN TO MAN! NO TICKET! NO TRICKS! JUST FISTS AND A FARE!',
    'PUT \'EM UP! MAN TO MAN! I\'LL TAKE IT OUT OF YOUR HIDE! WITH INTEREST!',
  ],
  shitty: [
    'COME ON! MAN TO MAN! WELL, MAN TO WHATEVER CRAWLED OUT OF THOSE PANTS!',
    'PUT \'EM UP! MAN TO MAN! I\'LL STAND UPWIND!',
  ],
  nude: [
    'COME ON! MAN TO MAN! I CAN SEE YOU\'RE A MAN! WE ALL CAN!',
    'PUT \'EM UP! MAN TO MAN! YOUR FISTS! NOT THAT!',
  ],
};
/** Meathead, walked up to the tree, his hand on the axe. */
export const MH_AXE: ByPants = {
  clean: ['MAN TO MAN? SURE.', 'HOLD THAT THOUGHT.'],
  shitty: ['MAN TO MAN. ONE OF US SHIT HIMSELF.', 'HOLD THAT THOUGHT. AND YOUR NOSE.'],
  nude: ['MAN TO MAN. ONE OF US HAS PANTS.', 'HOLD THAT THOUGHT. I\'M GONNA NEED BOTH HANDS.'],
};
/** The close-up's end: the trunk off him, the saw down to his nose, both eyes gone. */
export const TUCKER_SPLIT: ByPants = {
  clean: ['AAAAAGH! MY HEAD! MY HEADS!', 'AAAAAGH! THAT\'S COMING OUT OF YOUR DEPOSIT!'],
  shitty: ['AAAAAGH! MY HEADS! AND IT STILL STINKS!', 'AAAAAGH! BOTH HALVES CAN SMELL YOU!'],
  nude: ['AAAAAGH! MY HEADS! WORST THING I EVER SAW! TIED WITH YOU!', 'AAAAAGH! THAT\'S A DECENCY FINE AND A TREE!'],
};
/** Out from under it, groping: blind. */
export const TUCKER_BLIND: ByPants = {
  clean: ['I CAN\'T SEE! WHO TURNED OUT THE LIGHTS?!', 'I CAN\'T SEE! I CAN\'T SEE ANYTHING!'],
  shitty: ['I CAN\'T SEE! ...BUT WOW, CAN I SMELL!', 'I CAN\'T SEE! WHAT IS THAT?! IS THAT YOU?!'],
  nude: ['I CAN\'T SEE! ...OH THANK GOD!', 'I CAN\'T SEE! FINALLY! SOME GOOD NEWS!'],
};
/** Meathead, watching him feel his way round. */
export const MH_BLIND: ByPants = {
  clean: ['HE\'S HALF THE MAN HE USED TO BE. TWICE.', 'SPLIT THE BILL. SPLIT HIS FACE.'],
  shitty: ['HE CAN\'T SEE ME. LUCKY. HE CAN STILL SMELL ME.', 'BLIND AS A BAT. NOSE LIKE A BLOODHOUND.'],
  nude: ['FINALLY. SOMEBODY WHO CAN\'T SEE ME NAKED.', 'GOOD. NOW I\'M DECENT.'],
};
/** ...doesn't matter: squared up at the wrong tree. The fight starts here. */
export const TUCKER_MATTER: ByPants = {
  clean: ['DOESN\'T MATTER! I CAN HEAR A FREELOADER BREATHING!', 'DOESN\'T MATTER! A FARE\'S A FARE!'],
  shitty: ['DOESN\'T MATTER! I\'LL FOLLOW THE SMELL!', 'DOESN\'T MATTER! YOU LEAVE A TRAIL!'],
  nude: ['DOESN\'T MATTER! I\'LL FIND YOU BY THE BREEZE!', 'DOESN\'T MATTER! I\'LL HEAR IT SLAPPING!'],
};

const MEATHEAD = [MH_CAUGHT, MH_SKEWERED, FAKE_ME_OUT, MH_JUMPED, MH_AXE, MH_BLIND];
const TUCKER = [TUCKER_CAUGHT, TUCKER_RANT, TUCKER_HANDOUT, TUCKER_GUN, TUCKER_SKEWERED, TUCKER_JUMP, TUCKER_UP, TUCKER_ENTRANCE, TUCKER_TAUNT, TUCKER_SPLIT, TUCKER_BLIND, TUCKER_MATTER];

export const VOICE_LINES: Record<string, string[]> = {
  meathead: MEATHEAD.flatMap(allOf),
  [TUCKER_VOICE]: TUCKER.flatMap(allOf),
};
