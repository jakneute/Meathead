// What's said in the catch-up and Tucker's arena, by voice (frontier/voices.ts gathers it; tools/voices records it). In
// the user's voice: blunt, short, vulgar, specific; talk less; fit the trigger. Picked with pickLine. Every group in
// clean / shitty / naked pools (Tucker's, and Meathead's: they react to the state of him). Pure data (tools/voices
// bundles it in node). His fight's own lines go here when it's designed.

import { allOf, TUCKER_VOICE, type ByPants, type HurtTable } from '../talk';

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

// ---------------------------------------------------------------------------------------------------------------
// THE FIGHT (job G; the user's: blind, a flintlock, firing at sounds; bees after Meathead; every shot sends the small
// wildlife stampeding; the soul sucker's blood on him draws the mountain lions; the standard death's grizzly). His
// ledger, blind: he fires at noises, bills for everything, misjudges where Meathead is. "GIVE ME BACK MY DOLLAR TEN"
// is the Mel Gibson nod (the fare from the station's TUCKER_CAB).

/** Listening, shuffling, now and then (blind, the ledger). */
export const TF_TAUNT: ByPants = {
  clean: ['I CAN HEAR YOU BREATHING! THAT\'S A BREATHING FEE!', 'ONE FARE! A DOLLAR TEN! NOW IT\'S A HUNDRED!', 'I DON\'T NEED EYES TO BALANCE A LEDGER!'],
  shitty: ['I CAN\'T SEE YOU! I CAN SMELL EXACTLY WHERE YOU ARE!', 'FOLLOW THE STINK, TUCKER! FOLLOW THE STINK!', 'THAT\'S A CLEANING FEE! AND A NOSE FEE!'],
  nude: ['I CAN HEAR IT FLAPPING! THAT\'S A NOISE FEE!', 'BLIND! AND STILL NOT BLIND ENOUGH FOR YOU!', 'PUT SOMETHING ON! I CAN FEEL IT FROM HERE!'],
};
/** The bang. */
export const TF_FIRE: ByPants = {
  clean: ['PAY UP!', 'THAT\'S INTEREST!', 'HERE\'S YOUR CHANGE!', 'LATE FEE!'],
  shitty: ['PAY UP, STINKY!', 'RIGHT IN THE STINK!', 'THAT\'S FOR THE SEATS!'],
  nude: ['PAY UP, NAKED!', 'AIM FOR THE BREEZE!', 'THAT\'S A DECENCY FINE!'],
};
/** Heard him jump to his other side: round he comes. */
export const TF_HEAR: ByPants = {
  clean: ['I HEARD THAT!', 'BEHIND ME? NOBODY CUTS IN LINE!', 'OVER THERE, ARE YOU?'],
  shitty: ['I SMELLED THAT!', 'OVER THERE! THE WIND CHANGED!', 'BEHIND ME! I CAN TELL!'],
  nude: ['I HEARD IT SLAP!', 'OVER THERE! I FELT THE BREEZE!', 'BEHIND ME? DON\'T YOU DARE!'],
};
/** His shot hit. */
export const TF_HIT: ByPants = {
  clean: ['GOT YOU! PAID IN LEAD!', 'HA! THERE\'S YOUR RECEIPT!', 'PAYMENT RECEIVED!'],
  shitty: ['GOT YOU! SMELLS LIKE IT!', 'HA! SQUEEZED ONE OUT OF YOU!', 'PAYMENT RECEIVED! PLUS WHATEVER THAT WAS!'],
  nude: ['GOT YOU! SOMEWHERE SOFT, I HOPE!', 'HA! HIT SOMETHING FLOPPY!', 'PAYMENT RECEIVED! RIGHT IN THE BARE!'],
};
/** Ramming the rod down, by feel. */
export const TF_RELOAD: ByPants = {
  clean: ['POWDER. BALL. RAMROD. ALL ON YOUR TAB.', 'EVERY SHOT GOES ON YOUR BILL!', 'HOLD STILL! I\'M RELOADING!'],
  shitty: ['POWDER. BALL. AND A CLOTHESPIN FOR MY NOSE.', 'EVERY SHOT GOES ON YOUR BILL! SO DOES THE SMELL!'],
  nude: ['POWDER. BALL. RAMROD. DON\'T SAY IT.', 'EVERY SHOT GOES ON YOUR BILL! PANTS GO ON IT TOO!'],
};
/** Hit (anything but the cats). */
export const TF_HURT: ByPants = {
  clean: ['OW! THAT\'S ASSAULT! THAT\'S EXTRA!', 'I\'M BILLING YOU FOR THAT!', 'OW! ITEMIZED!'],
  shitty: ['OW! WITH THOSE HANDS?!', 'DON\'T TOUCH ME! YOU\'RE DIRTY!', 'OW! NOW I SMELL LIKE YOU!'],
  nude: ['OW! WAS THAT A HAND?! TELL ME THAT WAS A HAND!', 'DON\'T TOUCH ME WITH ANYTHING!', 'OW! WHAT HIT ME?! DON\'T ANSWER!'],
};
/** The bees on Meathead (he hears the yelling). */
export const TF_BEES: ByPants = {
  clean: ['BEES! GOOD! THEY WORK FOR FREE!', 'HEAR THAT BUZZING? THOSE ARE MY COLLECTORS!'],
  shitty: ['THE BEES FOUND YOU! THEY THINK YOU\'RE A FLOWER! A DEAD ONE!', 'BEES! THEY LOVE A STINK!'],
  nude: ['BEES! STING HIM WHERE IT COUNTS!', 'BEES! AND SO MUCH TO STING!'],
};
/** The critters off and running past him. */
export const TF_STAMPEDE: ByPants = {
  clean: ['GET OFF MY LAND, VARMINTS! NO FREE RIDES!', 'RABBITS! NOBODY PAID FOR THOSE EITHER!'],
  shitty: ['EVEN THE SKUNKS ARE RUNNING FROM YOU!', 'RUN, VARMINTS! HE SMELLS WORSE THAN YOU!'],
  nude: ['RUN, VARMINTS! DON\'T LOOK AT IT!', 'EVEN THE RABBITS ARE EMBARRASSED!'],
};
/** Showered in the soul sucker's blood. */
export const TF_BLOODY: ByPants = {
  clean: ['WHAT IS THIS?! IT\'S WARM! IT\'S IN MY HEADS!', 'IS THIS BLOOD?! WHOSE?! WHO\'S PAYING FOR THIS SUIT?!'],
  shitty: ['WHAT IS THIS?! PLEASE BE BLOOD! PLEASE BE BLOOD!', 'WARM AND WET! YOU BETTER NOT HAVE!'],
  nude: ['WHAT IS THIS?! IT\'S WARM! WHAT DID YOU DO?!', 'WARM AND STICKY! OH GOD! OH GOD!'],
};
/** The mountain lions on him. */
export const TF_MAULED: ByPants = {
  clean: ['GET OFF! YOU DIDN\'T PAY! NONE OF YOU PAID!', 'CATS! I\'M ALLERGIC! AND BEING EATEN!', 'NO! BAD KITTY! THAT\'S MY LEDGER ARM!'],
  shitty: ['GET OFF! EAT HIM! HE\'S PRE-SEASONED!', 'CATS! GO EAT THE STINKY ONE!'],
  nude: ['GET OFF! EAT HIM! HE\'S ALREADY UNWRAPPED!', 'CATS! THE NAKED ONE\'S RIGHT THERE! NO WRAPPER!'],
};
/** Up again after a mauling, more chewed. */
export const TF_GETUP: ByPants = {
  clean: ['I\'M FINE! THAT\'S A DEDUCTIBLE!', 'STILL HERE! STILL BILLING!', 'THEY TOOK A CHUNK! I\'M ADDING IT!'],
  shitty: ['I\'M FINE! THEY COULDN\'T FINISH ME! YOU RUINED MY FLAVOR!', 'STILL HERE! STILL SMELL YOU!'],
  nude: ['I\'M FINE! THEY LOST THEIR APPETITE! WONDER WHY!', 'STILL HERE! STILL GRATEFUL I\'M BLIND!'],
};
/** Low (once): manic. */
export const TF_LOW: ByPants = {
  clean: ['SHOT! SAWED! STABBED! SPLIT! CHEWED! GIVE ME BACK MY DOLLAR TEN!', 'GIVE ME BACK MY DOLLAR TEN!'],
  shitty: ['GIVE ME BACK MY DOLLAR TEN! AND MY SENSE OF SMELL!', 'I\'LL TAKE IT IN CASH! NOT IN WHATEVER THAT IS!'],
  nude: ['GIVE ME BACK MY DOLLAR TEN! YOU DON\'T EVEN HAVE POCKETS!', 'CASH! NOT WHATEVER YOU\'RE HIDING! YOU\'RE NOT HIDING ANYTHING!'],
};
/** The standard death: falling over, apparently dead. */
export const TF_FALL: ByPants = {
  clean: ['TELL MY ACCOUNTANT... I DIED... IN THE BLACK...', 'BALANCED... THE BOOKS...'],
  shitty: ['THE LAST THING... I SMELLED... WAS YOU... TERRIBLE...', 'THE STINK... IT\'S TAKING ME...'],
  nude: ['AT LEAST... I DIED... BLIND...', 'THE LAST THING... I FELT... WAS YOUR BREEZE...'],
};
/** ...and up again (the jumpscare). */
export const TF_POP: ByPants = {
  clean: ['AAAHHH! GOT YOU AGAIN!', 'AAAAAHHHHH!'],
  shitty: ['AAAHHH! STILL SMELL YOU!', 'AAAAAHHHHH!'],
  nude: ['AAAHHH! STILL NAKED?!', 'AAAAAHHHHH!'],
};
/** Gloating, the grizzly up behind him (he can't see it). */
export const TF_GLOAT: ByPants = {
  clean: ['NOW. ABOUT THAT DOLLAR TEN. ...WHO\'S BREATHING ON MY NECK?', 'NOBODY GETS OUT OF PAYING! ...WHY IS IT SO WARM BACK HERE?'],
  shitty: ['NOW. ABOUT THAT DOLLAR TEN. ...WHAT\'S THAT SMELL? IT\'S NOT YOU!', 'NOBODY GETS OUT OF PAYING! ...SOMETHING BACK HERE SMELLS WORSE THAN YOU!'],
  nude: ['NOW. ABOUT THAT DOLLAR TEN. ...WHO\'S BREATHING ON ME? PUT IT AWAY!', 'NOBODY GETS OUT OF PAYING! ...WHY IS IT HAIRY BACK HERE?'],
};
/** Last words, under the grizzly (its close-up). */
export const TF_LAST_BEAR: ByPants = {
  clean: ['NOT... COVERED... BY MY... INSURANCE...', 'BEARS... DON\'T... PAY... EITHER...'],
  shitty: ['EAT HIM... HE\'S... RIPER...', 'YOU\'RE EATING... THE WRONG ONE...'],
  nude: ['EAT HIM... HE\'S... ALREADY... PEELED...', 'WRONG ONE... HE\'S... THE NAKED ONE...'],
};
/** Last words, under the lions (the weakness kill, slowed). */
export const TF_LAST_LIONS: ByPants = {
  clean: ['PUT IT... ON MY... TAAAAB...', 'ITEMIZE... MEEEE...'],
  shitty: ['THIS... IS... YOUR... FAULT... STINKY...', 'EAT... THE STINKY ONE... NEXT...'],
  nude: ['AT LEAST... I NEVER... SAW IT...', 'THE NAKED ONE... HAS NO... WRAPPER...'],
};

/** Meathead: the blood's all over him. */
export const MH_SPRAY: ByPants = {
  clean: ['DINNER BELL.', 'HERE, KITTY KITTY.'],
  shitty: ['MARINATED. NOW WE WAIT.', 'SEASONED HIM WITH BUNNY.'],
  nude: ['HERE, KITTY KITTY. NOT YOU, LITTLE GUY.', 'MARINATED. NOW WE WAIT.'],
};
/** ...and the lions come out of the trees. */
export const MH_LIONS: ByPants = {
  clean: ['MOUNTAIN LIONS. RIGHT ON TIME.', 'GET HIM, PUSSYCATS.'],
  shitty: ['EAT HIM. NOT ME. I\'M SPOILED.', 'GOOD KITTIES. HE\'S THE TASTY ONE.'],
  nude: ['EAT HIM. I\'M ALL SKIN AND BONE.', 'GOOD KITTIES. DON\'T LOOK AT ME.'],
};
/** Thinking out loud (not getting anywhere): the critters, the sucker, something hungry out there. */
export const MH_HINT: ByPants = {
  clean: ['THOSE CRITTERS WOULD FIT IN THE SUCKER.', 'BUNNIES IN THE BAG. BAG ON THE CONDUCTOR.', 'SOMETHING IN THESE WOODS EATS CONDUCTORS. IT JUST NEEDS A SMELL.'],
  shitty: ['I NEED A STRONGER SMELL THAN ME. HARD TO FIND.', 'SUCK UP THE CRITTERS. SPRAY THE CONDUCTOR.'],
  nude: ['SUCK UP THE CRITTERS. SPRAY THE CONDUCTOR. THEN PANTS.', 'SOMETHING OUT THERE\'S HUNGRY. GIVE IT A SMELL.'],
};
/** The bag's got a spray's worth in it (the first time). */
export const MH_BAG: ByPants = {
  clean: ['BAG\'S FULL OF BUNNY. TIME TO SEASON THE CONDUCTOR.'],
  shitty: ['BAG\'S READY. SMELLS BETTER THAN ME.'],
  nude: ['BAG\'S READY. AT LEAST SOMETHING\'S FULL.'],
};
/** The standard death: walking up to the body. */
export const MH_WALKUP: ByPants = {
  clean: ['YOU DEAD? FOR REAL THIS TIME?', 'DON\'T YOU DARE.'],
  shitty: ['YOU DEAD? I\'M OUT OF SHIT TO SCARE OUT.', 'DON\'T. I\'M EMPTY.'],
  nude: ['YOU DEAD? I\'VE GOT NOTHING LEFT TO SHRINK.', 'DON\'T YOU DARE. I\'M NAKED.'],
};
/** ...jumped again. */
export const MH_POPPED: ByPants = {
  clean: ['OH, COME ON!', 'EVERY TIME! EVERY GODDAMN TIME!'],
  shitty: ['OH, COME ON! THAT ONE CAME OUT DRY!', 'EVERY TIME! MY ASS CAN\'T TAKE IT!'],
  nude: ['OH, COME ON! IT CRAWLED BACK INSIDE!', 'EVERY TIME! EVERYTHING JUST SHRANK AGAIN!'],
};
/** After the grizzly. */
export const MH_GRIZZLY: ByPants = {
  clean: ['AND STAY DEAD.', 'THE BEAR GETS THE TIP.'],
  shitty: ['THAT BEAR DID WHAT I COULDN\'T. RESPECT.', 'STAY DEAD. I\'M OUT OF PANTS TO SHIT.'],
  nude: ['STAY DEAD. THE BEAR CAN KEEP THE CHANGE.', 'GOOD BEAR. DON\'T LOOK AT ME.'],
};
/** After the lions. */
export const MH_LIONS_WON: ByPants = {
  clean: ['PAID IN FULL.', 'SPLIT THE CHECK. THREE WAYS.'],
  shitty: ['PAID IN FULL. THEY DIDN\'T EVEN WANT ME.', 'HE\'S IN EVERY CAT NOW.'],
  nude: ['PAID IN FULL. NOW WHERE ARE MY PANTS.', 'THEY ATE HIM. NOT ME. I\'LL TAKE IT.'],
};
/** A grab at him (too far gone to get a hold of). */
export const GRAB_TUCKER = ['HE\'S TOO SLIPPERY! IT\'S ALL BLOOD!', 'I\'M NOT HUGGING THAT!', 'HE\'S FALLING APART IN MY HANDS!'];

/** What hurts him in the fight (by source), and the death screen. (The critters' own: critters.ts.) */
export const FIGHT_HURT: HurtTable = {
  'm2:fr_tucker_shot': {
    hurt: ['HE SHOT ME! HE\'S BLIND!', 'A MUSKET BALL! IN ME!', 'LUCKY SHOT, YOU BLIND BASTARD!', 'HOW DID HE HIT THAT?!'],
    death: ['SHOT BY A BLIND MAN', 'THE BLIND CONDUCTOR COLLECTED'],
  },
  'm2:fr_glade_bees': {
    hurt: ['BEES! BEES!', 'WHY ARE THE BEES MAD AT ME?!', 'HE\'S THE ONE SHOOTING!'],
    death: ['STUNG TO DEATH. TOO MUCH RACKET.', 'THE BEES HATED THE NOISE'],
  },
  'm2:fr_rabbit': { hurt: ['A BUNNY HIT ME!', 'RABBIT! TO THE SHIN!'], death: ['TRAMPLED BY A BUNNY', 'KILLED BY A RABBIT. A RABBIT.'] },
  'm2:fr_squirrel': { hurt: ['SQUIRREL! IN MY FACE!', 'IT RAN UP MY LEG!'], death: ['RUN OVER BY A SQUIRREL', 'THE SQUIRREL DIDN\'T STOP'] },
  'm2:fr_raccoon': { hurt: ['RACCOON! IT BIT ME!', 'TRASH PANDA!'], death: ['MUGGED BY A RACCOON', 'A RACCOON TOOK HIS LIFE'] },
  'm2:fr_skunk': { hurt: ['SKUNK! OH GOD, THE SMELL!', 'IT SPRAYED ME!'], death: ['KILLED BY A SKUNK', 'HE SMELLED IT COMING'] },
  'm2:fr_turkey': { hurt: ['TURKEY! TURKEY!', 'THE BIRD KICKED ME!'], death: ['STAMPEDED BY A TURKEY', 'GOBBLED'] },
  'm2:fr_duck': { hurt: ['A DUCK! TO THE FACE!', 'DUCK! I SHOULD\'VE DUCKED!'], death: ['HIT BY A DUCK. HE DIDN\'T DUCK.', 'QUACKED TO DEATH'] },
  'm2:fr_bat': { hurt: ['BAT! IN MY HAIR!', 'GET IT OUT! GET IT OUT!'], death: ['FLOWN INTO BY A BAT', 'BATTED TO DEATH'] },
};

const MEATHEAD = [MH_CAUGHT, MH_SKEWERED, FAKE_ME_OUT, MH_JUMPED, MH_AXE, MH_BLIND, MH_SPRAY, MH_LIONS, MH_HINT, MH_BAG, MH_WALKUP, MH_POPPED, MH_GRIZZLY, MH_LIONS_WON];
const TUCKER = [TUCKER_CAUGHT, TUCKER_RANT, TUCKER_HANDOUT, TUCKER_GUN, TUCKER_SKEWERED, TUCKER_JUMP, TUCKER_UP, TUCKER_ENTRANCE, TUCKER_TAUNT, TUCKER_SPLIT, TUCKER_BLIND, TUCKER_MATTER,
  TF_TAUNT, TF_FIRE, TF_HEAR, TF_HIT, TF_RELOAD, TF_HURT, TF_BEES, TF_STAMPEDE, TF_BLOODY, TF_MAULED, TF_GETUP, TF_LOW, TF_FALL, TF_POP, TF_GLOAT, TF_LAST_BEAR, TF_LAST_LIONS];

export const VOICE_LINES: Record<string, string[]> = {
  meathead: [...MEATHEAD.flatMap(allOf), ...GRAB_TUCKER, ...Object.values(FIGHT_HURT).flatMap(h => h.hurt)],
  death: Object.values(FIGHT_HURT).flatMap(h => h.death),
  [TUCKER_VOICE]: TUCKER.flatMap(allOf),
};
