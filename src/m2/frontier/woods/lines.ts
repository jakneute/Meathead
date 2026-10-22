// What's said in the woods (outside the park) and at the bounty, by voice (frontier/voices.ts gathers it; tools/voices
// records it). In the user's voice: blunt, short, vulgar, specific; talk less; fit the trigger. Picked with pickLine.
// Meathead's lines, Tucker's and the teens' (they react to the state of him) in clean / shitty / naked pools. Pure data
// (tools/voices bundles it in node).
//
// The teens' voices (cast.json): two boys, two girls; job 6's TEENAGERS reuse them (TEEN_VOICES).

import { allOf, TUCKER_VOICE, type ByPants, type HurtTable } from '../talk';

/** The local kids on dirt bikes: boys and girls, each kid one of these by its seed (woods/teens.ts teenVoice). */
export const TEEN_VOICES = {
  boy: ['m2.frontier.teen', 'm2.frontier.teen2'],
  girl: ['m2.frontier.teenf', 'm2.frontier.teenf2'],
} as const;

// ---------------------------------------------------------------------------------------------------------------
// The walk in

/** Into the real woods, the first time (the park's behind him). */
export const REAL_WOODS: ByPants = {
  clean: ['THESE TREES DON\'T HAVE BOLTS IN THEM.', 'REAL WOODS. NO GIFT SHOP.'],
  shitty: ['REAL WOODS. NOBODY OUT HERE TO SMELL ME.', 'GOOD. TREES DON\'T JUDGE.'],
  nude: ['NAKED IN THE REAL WOODS. TICKS. EVERYWHERE.', 'REAL WOODS. REAL BREEZE. EVERYWHERE.'],
};

// ---------------------------------------------------------------------------------------------------------------
// The bounty (the user's beats: the kick, MINE, Tucker out of the leaf pile, the apology, the offer)

/** The first kid pulls up next to him, idling, friendly enough. */
export const KID_HI: ByPants = {
  clean: ['YO. YOU LOST, MISTER?', 'YO. YOU LOOK LIKE MY STEPDAD.'],
  shitty: ['DUDE. DID YOU SHIT YOURSELF?', 'BRO, YOU SMELL LIKE A PORTA-POTTY.'],
  nude: ['DUDE. WHERE ARE YOUR CLOTHES?', "BRO. THAT'S SO GROSS. I'M GONNA BARF."],
};
/** He kicks the kid off his bike (the user's line, in all three). */
export const MINE: ByPants = {
  clean: ['MINE.'],
  shitty: ['MINE.'],
  nude: ['MINE.'],
};
/** The kid, flat in the dirt, watching him sit on it. */
export const KID_DOWN: ByPants = {
  clean: ['THAT\'S MY BIKE!', 'DUDE! WHAT THE HELL?!'],
  shitty: ['NOT ON MY SEAT! NOT IN THOSE PANTS!', 'YOU\'RE GONNA SHIT ON MY SEAT!'],
  nude: ['HIS BARE ASS IS ON MY SEAT!', 'I SIT THERE! I SIT THERE!'],
};
/** Out of the leaf pile: his jumpscare (as he does every time he comes back). */
export const TUCKER_POP: ByPants = {
  clean: ['AAAHHH!', 'AAAAAHHHHH!'],
  shitty: ['AAAHHH! I SMELLED YOU!', 'AAAAAHHH!'],
  nude: ['AAAHHH! I SEE ALL OF YOU!', 'AAAAAHHH!'],
};
/** Sat on the bike he's just tackled a kid off, to the kid in the leaves: cheery, polite, a bookkeeper's manners. */
export const TUCKER_SORRY: ByPants = {
  clean: ['TERRIBLY SORRY, YOUNG MAN! OFFICIAL BUSINESS. I\'LL LEAVE A RECEIPT!', 'SO SORRY! I\'LL HAVE IT BACK BY SUPPER. MOSTLY!'],
  shitty: ['TERRIBLY SORRY, YOUNG MAN! WE\'RE AFTER THE SMELLY ONE.', 'SO SORRY! FARE DODGER. AND HE SOILED MY LOG.'],
  nude: ['TERRIBLY SORRY, YOUNG MAN! AVERT YOUR EYES FROM THAT MAN!', 'SO SORRY, EVERYBODY! HE\'S NOT ALWAYS NAKED. JUST TODAY.'],
};
/** The offer (the user's line, verbatim in all three; the shat and naked ones add a kicker). */
export const TUCKER_OFFER: ByPants = {
  clean: ['20 BUCKS FOR THE FIRST ONE TO GIVE ME THAT MEATHEAD\'S HEAD!'],
  shitty: ['20 BUCKS FOR THE FIRST ONE TO GIVE ME THAT MEATHEAD\'S HEAD! WEAR GLOVES!'],
  nude: ['20 BUCKS FOR THE FIRST ONE TO GIVE ME THAT MEATHEAD\'S HEAD! THE ONE ON HIS SHOULDERS!'],
};
/** The teens, happily obliging. */
export const TEENS_YES: ByPants = {
  clean: ['TWENTY BUCKS?! HELL YEAH!', 'DIBS ON HIS HEAD!'],
  shitty: ['TWENTY BUCKS! I\'LL HOLD MY BREATH!', 'HELL YEAH! SOMEBODY BRING A BAG!'],
  nude: ['TWENTY BUCKS TO HIT A NAKED GUY? HELL YEAH!', 'DIBS! DON\'T LOOK DOWN!'],
};
/** Him, on the kid's bike, looking at dozens of them revving up. */
export const BOUNTY_BACK: ByPants = {
  clean: ['TWENTY BUCKS? MY HEAD\'S WORTH WAY MORE THAN THAT.', 'TWENTY BUCKS. MY HEAD ALONE WEIGHS TWENTY POUNDS.'],
  shitty: ['TWENTY BUCKS? FOR THIS HEAD? INSULTING.', 'TWENTY BUCKS. AND I SHIT MYSELF FOR THIS.'],
  nude: ['TWENTY BUCKS? I\'M NAKED, NOT CHEAP.', 'TWENTY? FOR ALL THIS?'],
};

// ---------------------------------------------------------------------------------------------------------------
// After (the way back: the teens are off chasing; the kid he kicked off sulks on a stump)

/** The kid he kicked off, sulking, when he walks back by. */
export const KID_SULK: ByPants = {
  clean: ['YOU STOLE MY BIKE, MAN.', 'MY DAD\'S STILL MAKING PAYMENTS ON THAT BIKE.', 'EVERYBODY\'S GONE. THANKS A LOT.'],
  shitty: ['I\'M BURNING THAT SEAT.', 'YOU SHAT ON MY BIKE, DIDN\'T YOU.', 'IT STILL SMELLS LIKE YOU OVER HERE.'],
  nude: ['I SAW YOUR WHOLE ASS. I\'M TELLING EVERYBODY.', 'YOUR BARE ASS WAS ON MY SEAT, DUDE.', 'GO AWAY. AND PUT SOMETHING ON.'],
};

// ---------------------------------------------------------------------------------------------------------------
// What hurts him out here (the real bear trap is the wilds' m2:fr_beartrap: same jaws, no sign)

export const HURT: HurtTable = {
  'm2:fr_ivy': {
    hurt: ['ITCHY! ITCHY! ITCHY!', 'POISON IVY! ON MY EVERYTHING!', 'LEAVES OF THREE! I KNOW! I KNOW!', 'IT\'S IN MY CRACK!'],
    death: ['DIED OF POISON IVY', 'SCRATCHED HIMSELF TO DEATH', 'LEAVES OF THREE. HE DIDN\'T.'],
  },
};

const MEATHEAD = [REAL_WOODS, MINE, BOUNTY_BACK];
const TEEN = [KID_HI, KID_DOWN, TEENS_YES, KID_SULK];
const teenLines = TEEN.flatMap(allOf);
export const VOICE_LINES: Record<string, string[]> = {
  meathead: [...MEATHEAD.flatMap(allOf), ...Object.values(HURT).flatMap(h => h.hurt)],
  death: Object.values(HURT).flatMap(h => h.death),
  [TUCKER_VOICE]: [TUCKER_POP, TUCKER_SORRY, TUCKER_OFFER].flatMap(allOf),
  ...Object.fromEntries([...TEEN_VOICES.boy, ...TEEN_VOICES.girl].map(v => [v, teenLines])),
};
