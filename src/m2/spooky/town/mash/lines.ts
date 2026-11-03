// What's said at the MONSTER MASH cabinet, by voice (spooky/voices.ts gathers VOICE_LINES; tools/voices records them).
// The kid (KID: a smug little arcade rat), Meathead, and the cabinet's own cheap announcer (MASH: a tinny voice out of a
// busted speaker). Everything the kid or Meathead says about Meathead comes in clean / shitty / naked pools.

import { CHARS, ROSTER, type CharId } from './data';

export const KID = 'm2.spooky.mashkid';
export const MASH = 'm2.spooky.mashvoice';
interface ByPants { clean: string[]; shitty: string[]; nude: string[] }

// ---- The cabinet's announcer ----
export const A_TITLE = 'MONSTER MASH!';
export const A_SELECT = 'CHOOSE YOUR MONSTER!';
export const A_INVIS = 'HE IS THERE. PROBABLY.';
export const A_ROUND = ['ROUND 1', 'ROUND 2', 'FINAL ROUND'];
export const A_FIGHT = 'FIGHT!';
export const A_KO = 'KNOCK OUT!';
export const A_END = 'END THEM!';
export const A_FATAL = 'MONSTROSITY!';
export const A_FLAWLESS = 'FLAWLESS MASH!';
export const A_WINS: Record<string, string> = Object.fromEntries(ROSTER.map(id => [id, `${CHARS[id].short} WINS!`]));
export const A_CALL: Record<string, string> = Object.fromEntries(ROSTER.map(id => [id, CHARS[id].call]));

// ---- The kid ----
/** UP to him: the challenge. */
export const KID_CHALLENGE: ByPants = {
  clean: ['HEY, MEATBALL. YOU PLAY MONSTER MASH? BEAT ME AND YOU GET MY GLOWY ROCK.', 'YOU LOOK LIKE YOU SUCK AT VIDEO GAMES. ONE GAME. MY GLOWY ROCK SAYS YOU LOSE.'],
  shitty: ['DUDE, YOU SHIT YOURSELF. I CAN SMELL IT FROM HERE. ONE GAME FOR MY GLOWY ROCK.', 'MY MOM SAYS DON\'T TALK TO GUYS WHO POOPED THEIR PANTS. ONE GAME. FOR MY GLOWY ROCK.'],
  nude: ['WHY ARE YOU NAKED IN AN ARCADE? GROSS. ONE GAME. YOU WIN, YOU GET MY GLOWY ROCK.', 'MISTER, YOUR BUTT IS OUT. ONE GAME FOR MY GLOWY ROCK. STAND FAR AWAY.'],
};
/** Flagging Meathead down as he comes up (rare: CALL_EVERY apart, never over anybody). */
export const KID_CALL: ByPants = {
  clean: ['HEY! MUSCLES! YOU PLAY MONSTER MASH?', 'YO, MEATBALL! OVER HERE! I GOT A GLOWY ROCK!', 'HEY, OLD GUY! COME GET YOUR BUTT KICKED!'],
  shitty: ['HEY, POOPY PANTS! COME LOSE AT MONSTER MASH!', 'YO, STINKY! OVER HERE! STAND DOWNWIND!'],
  nude: ["HEY, NAKED GUY! OVER HERE! DON'T TOUCH THE STICK!", 'YO, BUTT MAN! COME PLAY! STAND BACK A LITTLE!'],
};
/** Meathead walked off and the kid's gone off the screen behind him (never played, quit, or lost): calling after him. */
export const KID_LEAVE: ByPants = {
  clean: ['WHERE ARE YOU GOING? COME BACK!', 'HEY! GET BACK HERE, CHICKEN!', 'FINE! WALK AWAY! LOSER!'],
  shitty: ['WHERE ARE YOU GOING? TO CHANGE? COME BACK!', 'HEY! COME BACK! LEAVE THE SMELL THOUGH!'],
  nude: ['WHERE ARE YOU GOING, NAKED GUY? COME BACK!', 'HEY! COME BACK! BUTT FIRST IS FINE!'],
};
/** The same, sore: Meathead beat him last. */
export const KID_LEAVE_WON: ByPants = {
  clean: ['YEAH, RUN! YOU GOT LUCKY!', 'COME BACK! I WANT A REMATCH!'],
  shitty: ['GO ON! TAKE YOUR STINK AND MY ROCK!', 'COME BACK! THAT WIN SMELLED FAKE!'],
  nude: ['GO ON! WIN NAKED SOMEWHERE ELSE!', 'COME BACK! I DEMAND A REMATCH, NUDIE!'],
};
/** The same, after his rock's gone. */
export const KID_CALL_AGAIN: ByPants = {
  clean: ['HEY, CHEATER! REMATCH!', 'YO! I PRACTICED! GET OVER HERE!'],
  shitty: ['HEY, STINKY CHEATER! REMATCH!', 'YO, POOP GUY! I PRACTICED!'],
  nude: ['HEY, NAKED CHEATER! REMATCH!', 'YO, NUDIE! I PRACTICED! PANTS OPTIONAL!'],
};
/** UP to him after his rock's gone. */
export const KID_AGAIN: ByPants = {
  clean: ['NO MORE ROCKS. PLAY FOR PRIDE, LOSER.', 'BACK FOR MORE? NO PRIZE THIS TIME. JUST SHAME.'],
  shitty: ['NO MORE ROCKS. YOU STILL STINK. ONE MORE?', 'YOU AGAIN. YOU SMELL WORSE. NO PRIZE.'],
  nude: ['STILL NAKED? ONE MORE GAME. NO ROCK.', 'YOU STILL HAVEN\'T FOUND PANTS? FINE. NO PRIZE.'],
};
/** He said no. */
export const KID_CHICKEN: ByPants = {
  clean: ['BAWK BAWK. CHICKEN.', 'THOUGHT SO. GRANDPA HANDS.'],
  shitty: ['CHICKEN. A SHITTY CHICKEN.', 'GO CHANGE YOUR DIAPER, CHICKEN.'],
  nude: ['NAKED CHICKEN. GROSS.', 'GO FIND YOUR PANTS, CHICKEN.'],
};
/** Picking his fighter. */
export const KID_PICK = ['I ALWAYS PICK THIS GUY. HE IS BROKEN.', 'WATCH THIS. I KNOW ALL THE CODES.', 'MY BROTHER SAYS THIS GUY IS CHEAP. MY BROTHER IS IN JAIL.'];
/** Meathead picked the Invisible Man. */
export const KID_INVIS = ['YOU PICKED NOBODY. LITERALLY NOBODY.', 'THE INVISIBLE GUY? HE DOESN\'T EVEN HAVE A GUY.'];
/** The kid took the round. */
export const KID_ROUND_WON: ByPants = {
  clean: ['GET OWNED, GRANDPA.', 'DID YOU EVEN PRESS A BUTTON?'],
  shitty: ['OWNED. AND YOU STINK.', 'YOU PLAY LIKE YOU SMELL.'],
  nude: ['OWNED. PUT SOME PANTS ON.', 'YOUR BUTT IS DISTRACTING AND I STILL WON.'],
};
/** He lost the round. */
export const KID_ROUND_LOST: ByPants = {
  clean: ['THAT DIDN\'T COUNT. MY HAND SLIPPED.', 'THE STICK IS BROKEN. EVERYBODY KNOWS.'],
  shitty: ['I COULDN\'T SEE. YOUR SMELL MADE MY EYES WATER.', 'NO FAIR. I\'M GAGGING OVER HERE.'],
  nude: ['I SAW YOUR BUTT BY ACCIDENT. THAT DOESN\'T COUNT.', 'NO FAIR. YOUR NAKED IS IN MY EYES.'],
};
/** He won the match: the gloat, and the rematch. */
export const KID_GLOAT: ByPants = {
  clean: ['HA! YOU SUCK. WANNA GO AGAIN, LOSER?', 'THAT WAS SO SAD. AGAIN? I\'LL USE ONE HAND.'],
  shitty: ['YOU LOST AND YOU SHIT YOURSELF. WORST DAY EVER. AGAIN?', 'BEAT BY A KID, IN POOPY PANTS. AGAIN?'],
  nude: ['YOU LOST NAKED. THAT\'S TWO LOSSES. AGAIN?', 'NAKED AND BAD AT GAMES. AGAIN, MISTER?'],
};
/** Meathead walked away after losing. */
export const KID_QUIT = ['QUITTER! I\'M PUTTING YOUR INITIALS AS POOPY.', 'BYE, LOSER. TELL YOUR FRIENDS.'];
/** He quit mid-game from the pause menu (QUIT MINIGAME): the kid calls him out. */
export const KID_RAGEQUIT: ByPants = {
  clean: ["YOU RAGE QUIT? I'M NINE!", "YOU'RE PULLING THE PLUG? THAT'S A FORFEIT. I WIN FOREVER.", 'QUITTER! I GET TO PUT YOUR INITIALS AS POOPY.'],
  shitty: ["QUITTER! YOU QUIT AND YOU POOPED. THAT'S TWO LOSSES.", 'GO HOME AND CHANGE, QUITTER.'],
  nude: ['QUITTER! GO HOME AND PUT ON PANTS, QUITTER.', "YOU QUIT NAKED. THAT'S THE SADDEST THING I EVER SAW."],
};
/** He lost the match: sore, and the rock. */
export const KID_SORE: ByPants = {
  clean: ['YOU CHEATED. FINE. TAKE THE STUPID ROCK.', 'THIS GAME IS FOR BABIES ANYWAY. HERE. TAKE IT.'],
  shitty: ['YOU CHEATED. TAKE IT. DON\'T TOUCH ME WITH YOUR POOP HANDS.', 'FINE. TAKE THE ROCK. YOU STILL SMELL LIKE A BUTT.'],
  nude: ['FINE. TAKE THE ROCK. WHERE ARE YOU EVEN GONNA PUT IT?', 'YOU WIN. YOU\'RE STILL NAKED. I WIN AT LIFE.'],
};
/** He lost again (no rock left to give). */
export const KID_SORE_AGAIN = ['WHATEVER. I\'M TELLING MY MOM.', 'I LET YOU WIN. FOR CHARITY.'];

// ---- Meathead ----
/** His answer to the challenge. */
export const MH_TAKE: ByPants = {
  clean: ['A CHILD WANTS TO DIE. FINE.', 'KID, I WAS PLAYING ARCADES BEFORE YOUR DAD LEFT.'],
  shitty: ['THE SMELL IS PART OF MY STRATEGY. RACK EM.', 'I AM CARRYING A LOAD AND I WILL STILL BEAT YOU.'],
  nude: ['NAKED GAMERS PLAY BETTER. IT IS SCIENCE.', 'THE PANTS WERE HOLDING ME BACK. RACK EM.'],
};
export const MH_ROUND_WON: ByPants = {
  clean: ['SIT DOWN, SKIDMARK.', 'THAT IS CALLED SKILL. LOOK IT UP.'],
  shitty: ['EVEN WITH A LOAD IN MY PANTS.', 'I SHIT MYSELF AND I\'M STILL BETTER THAN YOU.'],
  nude: ['FREE BALLING IT. UNDEFEATED.', 'NO PANTS. NO MERCY.'],
};
export const MH_ROUND_LOST: ByPants = {
  clean: ['THE STICK IS STICKY. WHY IS IT STICKY.', 'I WAS LETTING YOU WIN. FOR YOUR SELF ESTEEM.'],
  shitty: ['IT IS HARD TO CROUCH LIKE THIS.', 'I SHIFTED AND IT SQUISHED. NOT FAIR.'],
  nude: ['THE CONTROLS ARE COLD ON MY THIGHS.', 'I GOT DISTRACTED BY THE BREEZE.'],
};
export const MH_MATCH_LOST: ByPants = {
  clean: ['I DID NOT LOSE TO A CHILD. THE CHILD CHEATED.', 'THIS MACHINE IS RIGGED. I\'M CALLING THE BETTER BUSINESS BUREAU.'],
  shitty: ['THAT\'S IT. I\'M SHITTING ON THIS CABINET.', 'I LOST AND I\'M SITTING IN IT. GREAT.'],
  nude: ['BEATEN BY A CHILD, NAKED, IN PUBLIC. NEW LOW.', 'I NEED PANTS AND A REMATCH.'],
};
export const MH_MATCH_WON: ByPants = {
  clean: ['CRY ABOUT IT, NERD.', 'THAT\'S FOR EVERY KID WHO EVER BEAT ME AT ANYTHING.'],
  shitty: ['BEATEN BY A MAN WITH A FULL LOAD. LIVE WITH IT.', 'SMELL THAT? THAT\'S VICTORY. AND POOP.'],
  nude: ['BEATEN BY A NAKED MAN. TELL YOUR THERAPIST.', 'NAKED. VICTORIOUS. HOME BY SIX.'],
};

// ---- Trash talk in the bouts (the owner's: "make sure meathead and the kid trash talk during the fight too and they
// mock their character choices, each"; "and of course special lines if it happens to be a mirror match"). Spaced out
// (index.ts BANTER_GAP), never over anybody, on the cabinet's strip only while said.

/** The kid on Meathead's pick. */
export const KID_MOCK: Record<CharId, ByPants> = {
  drac: {
    clean: ['DRACULA? HE SLEEPS IN A BOX. LIKE YOUR CAREER.', 'DRACULA IS FOR GIRLS WHO WEAR BLACK LIPSTICK.'],
    shitty: ['DRACULA HATES GARLIC. HE HATES YOUR SMELL WORSE.'],
    nude: ['DRACULA HAS A CAPE. BORROW IT. PLEASE.'],
  },
  monster: {
    clean: ['THE MONSTER? YOU BOTH WALK LIKE YOU POOPED.', 'YOU PICKED THE ONE WITH NO BRAIN. MAKES SENSE.'],
    shitty: ['YOU AND THE MONSTER BOTH SMELL LIKE A DEAD GUY.'],
    nude: ['EVEN THE MONSTER WEARS PANTS, MISTER.'],
  },
  mummy: {
    clean: ['THE MUMMY? HE IS JUST A GUY IN TOILET PAPER.', 'THE MUMMY IS SLOW. LIKE YOU.'],
    shitty: ["YOU NEED THE MUMMY'S TOILET PAPER MORE THAN HE DOES."],
    nude: ['THE MUMMY IS ALL WRAPPED UP. YOU SHOULD TRY IT.'],
  },
  jekyll: {
    clean: ['JEKYLL NEEDS A POTION TO BE COOL. SAME AS YOU.', 'MY DAD PICKS JEKYLL. MY DAD IS BAD.'],
    shitty: ['HE DRINKS A POTION. YOU DRANK BAD CHILI.'],
    nude: ['EVEN JEKYLL KEEPS HIS PANTS ON WHEN HE CHANGES.'],
  },
  invis: {
    clean: ["YOU PICKED THE INVISIBLE GUY SO I CAN'T SEE YOU LOSE.", 'NOBODY PICKS HIM. LITERALLY NOBODY.'],
    shitty: ['SMART. NOBODY CAN SEE HIS POOP EITHER.'],
    nude: ['A NAKED INVISIBLE GUY. YOU HAVE A TYPE.'],
  },
  phantom: {
    clean: ['THE PHANTOM HIDES HIS FACE. YOU SHOULD TOO.', 'THE OPERA GUY? WHAT A NERD.'],
    shitty: ["HE WEARS A MASK SO HE CAN'T SMELL YOU."],
    nude: ['HE COVERS HALF HIS FACE. COVER HALF YOUR BUTT.'],
  },
  quasi: {
    clean: ['QUASIMODO? YOU PICKED THE UGLY ONE. MIRROR MUCH?', 'HE RINGS BELLS. YOU RING NOTHING.'],
    shitty: ['HE HAS A HUMP. YOU HAVE A LUMP. IN YOUR PANTS.'],
    nude: ["QUASIMODO IS UGLY BUT AT LEAST HE'S DRESSED."],
  },
};
/** Meathead on the kid's pick (the kid never picks the Invisible Man). */
export const MH_MOCK: Partial<Record<CharId, string[]>> = {
  drac: ['DRACULA. A GROWN MAN WHO BITES. LIKE YOUR LITTLE BROTHER.', 'NICE CAPE, KID. DOES YOUR MOM IRON IT?'],
  monster: ['YOU PICKED A GUY SEWN TOGETHER FROM LOSERS. RELATABLE.', 'FRANKENSTEIN. BIG, DUMB, GREEN. YOUR DREAM DAD.'],
  mummy: ["A GUY MADE OF TOILET PAPER. I'M GONNA WIPE WITH HIM.", 'YOU PICKED A DEAD GUY. HE HAS MORE MOVES THAN YOU.'],
  jekyll: ['JEKYLL AND HYDE. TWO GUYS. BOTH LOSING.', 'A DOCTOR. YOUR MOM WOULD BE SO PROUD. FOR ONCE.'],
  phantom: ['THE OPERA GUY. WHAT ARE YOU, A THEATER KID?', 'HALF A MASK. HALF A FIGHTER. HALF A KID.'],
  quasi: ['QUASIMODO. YOU PICKED THE ONE THAT LOOKS LIKE YOU.', 'THE HUNCHBACK. SIT UP STRAIGHT, KID. BOTH OF YOU.'],
};
/** A mirror match: the kid. */
export const KID_MIRROR: ByPants = {
  clean: ['COPYCAT! I PICKED HIM FIRST!', "YOU CAN'T PICK THE SAME GUY. IT'S A RULE. MY RULE."],
  shitty: ['YOU PICKED MY GUY AND MADE HIM SMELL.', "MINE'S THE ONE THAT DIDN'T POOP."],
  nude: ["MINE'S THE ONE WITH PANTS ON.", 'COPYCAT. A NAKED COPYCAT.'],
};
export const KID_MIRROR_BY: Partial<Record<CharId, string[]>> = {
  drac: ['TWO DRACULAS. MINE IS THE COOL ONE.'],
  monster: ["MY MONSTER IS SEWN BETTER THAN YOUR MONSTER."],
  mummy: ['TWO MUMMIES. YOURS IS THE ONE THAT SMELLS LIKE A BUTT.'],
  jekyll: ['TWO JEKYLLS. THAT IS FOUR GUYS. YOU ARE ALL FOUR LOSERS.'],
  phantom: ['TWO PHANTOMS. YOURS IS THE UGLY HALF.'],
  quasi: ['TWO QUASIMODOS. WHICH ONE IS UGLIER? YOURS.'],
};
/** A mirror match: Meathead. */
export const MH_MIRROR = ['THE SAME GUY. NOW WE FIND OUT WHO IS GOOD.', 'QUIT COPYING ME. I PICKED HIM IN MY HEART FIRST.', "MINE'S THE REAL ONE. YOURS IS A KNOCKOFF."];
export const MH_MIRROR_BY: Partial<Record<CharId, string[]>> = {
  drac: ['TWO DRACULAS. ONE OF US SUCKS. IT IS YOU.'],
  monster: ['TWO MONSTERS. MINE HAS THE BETTER DEAD GUYS IN HIM.'],
  mummy: ['TWO MUMMIES. A TOILET PAPER FIGHT.'],
  jekyll: ['ME, YOU, JEKYLL, HYDE, JEKYLL, HYDE. CROWDED.'],
  phantom: ['TWO PHANTOMS. HALF A FACE EACH. ONE WHOLE LOSER.'],
  quasi: ['TWO HUNCHBACKS. WE LOOK LIKE A FAMILY REUNION.'],
};
/** He hurt Meathead bad (a big hit, a throw, a special): the kid. */
export const KID_TAUNT: ByPants = {
  clean: ['EAT IT, GRANDPA!', 'DID THAT HURT? IT LOOKED LIKE IT HURT.', 'GET GOOD, OLD MAN!'],
  shitty: ['HIT YOU SO HARD YOU POOPED. OH WAIT. ALREADY DID.', 'THAT ONE KNOCKED THE SMELL LOOSE.'],
  nude: ['RIGHT IN YOUR NAKED FACE!', 'THAT ONE WAS FOR YOUR BUTT BEING OUT.'],
};
/** Meathead hurt him bad. */
export const MH_TAUNT = ['SIT DOWN, BRACES.', 'GO CRY TO YOUR MOM.', 'THAT IS A GROWN-MAN COMBO.', 'CRY INTO YOUR SLUSHIE.'];
/** Low on health, each of them. */
export const KID_LOW = ['NO NO NO NO NO.', 'MY STICK IS STICKY! NOT FAIR!'];
export const MH_LOW = ['I AM LOSING TO A FOURTH GRADER.', "OKAY. OKAY. NOW I'M TRYING."];

const all = (b: ByPants) => [...b.clean, ...b.shitty, ...b.nude];
const each = <T,>(r: Partial<Record<CharId, T>>) => Object.values(r) as T[];
export const VOICE_LINES: Record<string, string[]> = {
  [MASH]: [A_TITLE, A_SELECT, A_INVIS, ...A_ROUND, A_FIGHT, A_KO, A_END, A_FATAL, A_FLAWLESS, ...Object.values(A_WINS), ...Object.values(A_CALL)],
  [KID]: [...all(KID_CALL), ...all(KID_CALL_AGAIN), ...all(KID_LEAVE), ...all(KID_LEAVE_WON), ...all(KID_CHALLENGE), ...all(KID_AGAIN), ...all(KID_CHICKEN), ...KID_PICK, ...KID_INVIS, ...all(KID_ROUND_WON), ...all(KID_ROUND_LOST), ...all(KID_GLOAT), ...KID_QUIT, ...all(KID_RAGEQUIT), ...all(KID_SORE), ...KID_SORE_AGAIN,
    ...each(KID_MOCK).flatMap(all), ...all(KID_MIRROR), ...each(KID_MIRROR_BY).flat(), ...all(KID_TAUNT), ...KID_LOW],
  meathead: [...all(MH_TAKE), ...all(MH_ROUND_WON), ...all(MH_ROUND_LOST), ...all(MH_MATCH_LOST), ...all(MH_MATCH_WON),
    ...each(MH_MOCK).flat(), ...MH_MIRROR, ...each(MH_MIRROR_BY).flat(), ...MH_TAUNT, ...MH_LOW],
};
