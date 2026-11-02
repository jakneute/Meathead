// What's said at the MONSTER MASH cabinet, by voice (spooky/voices.ts gathers VOICE_LINES; tools/voices records them).
// The kid (KID: a smug little arcade rat), Meathead, and the cabinet's own cheap announcer (MASH: a tinny voice out of a
// busted speaker). Everything the kid or Meathead says about Meathead comes in clean / shitty / naked pools.

import { CHARS, ROSTER } from './data';

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

const all = (b: ByPants) => [...b.clean, ...b.shitty, ...b.nude];
export const VOICE_LINES: Record<string, string[]> = {
  [MASH]: [A_TITLE, A_SELECT, A_INVIS, ...A_ROUND, A_FIGHT, A_KO, A_END, A_FATAL, A_FLAWLESS, ...Object.values(A_WINS), ...Object.values(A_CALL)],
  [KID]: [...all(KID_CHALLENGE), ...all(KID_AGAIN), ...all(KID_CHICKEN), ...KID_PICK, ...KID_INVIS, ...all(KID_ROUND_WON), ...all(KID_ROUND_LOST), ...all(KID_GLOAT), ...KID_QUIT, ...all(KID_SORE), ...KID_SORE_AGAIN],
  meathead: [...all(MH_TAKE), ...all(MH_ROUND_WON), ...all(MH_ROUND_LOST), ...all(MH_MATCH_LOST), ...all(MH_MATCH_WON)],
};
