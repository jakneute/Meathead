// What's said on Timber Tumble, in the sewer and down the real river, by voice (frontier/voices.ts gathers it;
// tools/voices records it). In the user's voice: blunt, short, vulgar, specific; talk less; fit the trigger. Picked
// with pickLine. Meathead's lines, Tucker's and everybody reacting to Meathead in clean / shitty / naked pools (the
// ride's recorded spiel can't see him: one pool). Pure data (tools/voices bundles it in node).

import { allOf, TUCKER_VOICE, type ByPants, type HurtTable } from '../talk';

/** The ride operator (a man or a woman, by the visit), the ride's recorded spiel (the park's PA), the logging crew. */
export const RIDE_VOICES = {
  operator: 'm2.frontier.operator', operatorf: 'm2.frontier.operatorf',
  spiel: 'm2.frontier.announcer',
  crew: 'm2.frontier.townsman', crewf: 'm2.frontier.townswoman',
} as const;

// ---------------------------------------------------------------------------------------------------------------
// Tucker (the booth: a hole through his eye, still going)

/** At the controls, the operator shoved out of the way, his hand over the button (the user's line, in all three). */
export const TUCKER_ENGAGE: ByPants = {
  clean: ['TIME TO ENGAGE THE BUZZSAWS!', 'FOUR DOLLARS, PLUS INTEREST. TIME TO ENGAGE THE BUZZSAWS!'],
  shitty: ['YOU SOILED MY LINE! TIME TO ENGAGE THE BUZZSAWS!', 'TIME TO ENGAGE THE BUZZSAWS! THE LOG GETS BURNED AFTER!'],
  nude: ['NO PANTS, NO TICKET! TIME TO ENGAGE THE BUZZSAWS!', 'TIME TO ENGAGE THE BUZZSAWS! AIM LOW!'],
};
/** The saw in his forehead: his last words (again). */
export const TUCKER_SAWED: ByPants = {
  clean: ["OH. THAT'S A SPLITTING HEADACHE.", 'PUT THE SAW... ON HIS TAB...'],
  shitty: ['SPLITTING HEADACHE... AND HE STILL STINKS...', 'BILL HIM... FOR THE SAW... AND THE SMELL...'],
  nude: ['SPLITTING HEADACHE... PUT SOME PANTS ON...', 'ADD IT... TO THE NAKED MAN\'S TAB...'],
};

// ---------------------------------------------------------------------------------------------------------------
// The operator

/** He cuts the whole line and goes for a log. */
export const OP_CUT: ByPants = {
  clean: ['HEY! BACK OF THE LINE!', 'SIR! THERE IS A NINETY MINUTE LINE!'],
  shitty: ['SIR! BACK OF THE— OH GOD, THE SMELL.', 'NOT IN MY LOG! NOT IN THOSE PANTS!'],
  nude: ['SIR! YOU NEED CLOTHES TO RIDE!', 'NO! NAKED PEOPLE DO NOT GET LOGS!'],
};
/** Shoved out of the booth by Tucker. */
export const OP_SHOVED: ByPants = {
  clean: ['HEY! THAT IS MY BOOTH!', 'OW! YOU CANNOT BE IN HERE!'],
  shitty: ['HEY! MY BOOTH! AND SOMETHING SMELLS!', 'OW! WHY DOES EVERYBODY TODAY SMELL?!'],
  nude: ['HEY! MY BOOTH! WHY IS EVERYBODY CRAZY TODAY?!', 'OW! FIRST A NAKED GUY, NOW THIS!'],
};
/** Back up, the conductor dead on her floor with a saw in his head, the log going. */
export const OP_AFTER: ByPants = {
  clean: ['UH... KEEP YOUR ARMS INSIDE THE LOG.', 'ENJOY TIMBER TUMBLE. I QUIT.'],
  shitty: ['KEEP YOUR ARMS INSIDE. WE ARE BURNING THAT LOG AFTER.', 'ENJOY THE RIDE. I AM HOSING THAT LOG OUT.'],
  nude: ['KEEP YOUR ARMS... AND EVERYTHING... INSIDE THE LOG.', 'ENJOY THE RIDE. PLEASE SIT DOWN. PLEASE.'],
};
/** Him in a log again (back from dying, or round again another visit). */
export const OP_AGAIN: ByPants = {
  clean: ['YOU AGAIN? THE SAWS ARE STILL ON.', 'NOBODY KNOWS HOW TO TURN THE SAWS OFF. HAVE FUN.'],
  shitty: ['YOU AGAIN? SIT IN THE BACK LOG. IT IS ALREADY RUINED.', 'GREAT. THE SMELLY ONE. THE SAWS ARE STILL ON.'],
  nude: ['YOU AGAIN? STILL NAKED? THE SAWS ARE STILL ON.', 'NAKED GUY, LOG FOUR. GOD HELP US.'],
};

// ---------------------------------------------------------------------------------------------------------------
// The ride's recorded spiel (the park's PA: it can't see him)

export const SPIEL_CREEK = ['HOWDY, PARTNERS! ON YOUR LEFT, THE BUSY BEAVERS OF BEAVER CREEK!'];
export const SPIEL_MILL = ['THE OLD SAWMILL! MIND THE BLADES! THAT IS JUST A JOKE, FOLKS!'];
export const SPIEL_DROP = ['HOLD ON TO YOUR HATS! HERE COMES TIMBER TUMBLE!'];
/** The big red button slammed in the booth: the ride's own voice, chirpy as ever. */
export const SPIEL_BUZZMODE = ['BUZZSAW MODE ENGAGED. PLEASE KEEP ALL LIMBS INSIDE THE LOG.'];

// ---------------------------------------------------------------------------------------------------------------
// The logging crew (real loggers, out past the park)

/** The log coming up their conveyor with a man in it. */
export const CREW_JUMP: ByPants = {
  clean: ['HEY! JUMP! JUMP!', 'GET OUT OF THE LOG! THE CHIPPER!'],
  shitty: ['JUMP! AND DO NOT LAND NEAR ME!', 'JUMP, STINKY! JUMP!'],
  nude: ['NAKED GUY! JUMP!', 'JUMP! AND COVER UP!'],
};
/** He's down on their clearing, their log mulched: they come at him with the chainsaws. */
export const CREW_MAD: ByPants = {
  clean: ['THAT WAS OUR LOG, ASSHOLE!', 'YOU MULCHED A WHOLE LOG! GET HIM!'],
  shitty: ['HE SHAT IN OUR CHIPPER! GET HIM!', 'YOU STINK AND YOU OWE US A LOG!'],
  nude: ['NAKED GUY KILLED OUR LOG! GET HIM!', 'PUT IT AWAY AND PAY FOR THE LOG!'],
};
/** Anybody thrown into the chipper (the announcer's kill callout). */
export const CHIPPED_CALLS = ['CHIPPED!', 'MULCHED!', 'FED THE CHIPPER!', 'WOOD CHIPS!', 'LANDSCAPED!'];

// ---------------------------------------------------------------------------------------------------------------
// Meathead (he loves rides)

/** Tucker down with a saw in his forehead. */
export const DEAD_AGAIN: ByPants = {
  clean: ['DEAD AGAIN. I GIVE IT TEN MINUTES.', 'NICE HAT, TUCKER.'],
  shitty: ['HE GOT A SAW. I GOT SHIT IN MY PANTS. EVEN.', 'DEAD AGAIN. LUCKY. HE CAN\'T SMELL ME.'],
  nude: ['HE KEEPS DYING. I KEEP BEING NAKED.', 'DEAD AGAIN. HE DIED LOOKING AT MY DICK.'],
};
/** The log moving. */
export const RIDE_START: ByPants = {
  clean: ['I LOVE LOG RIDES.', 'LOG RIDE. HELL YES.'],
  shitty: ['LOG RIDE. GOOD. RINSE THE PANTS.', 'SPLASH ZONE. I NEED IT.'],
  nude: ['LOG RIDE. NAKED. SPLINTERS.', 'NO PANTS. LOG RIDE. LET\'S GO.'],
};
/** The first saw coming. */
export const FIRST_SAW: ByPants = {
  clean: ['BUZZSAWS. ON A LOG RIDE. FIVE STARS.', 'SAWS! THIS RIDE GOT BETTER.'],
  shitty: ['SAWS. GOOD THING I ALREADY SHAT.', 'BUZZSAWS. TOO LATE TO SHIT MYSELF.'],
  nude: ['BUZZSAWS. AND MY DICK OUT.', 'SAWS AT CROTCH HEIGHT. AND I AM NAKED.'],
};
/** Up the lift hill. */
export const LIFT_HILL: ByPants = {
  clean: ['CLICK CLICK CLICK. BEST SOUND THERE IS.', 'LIFT HILL. HERE COMES THE GOOD PART.'],
  shitty: ['UP THE HILL. CLICK CLICK. SQUISH SQUISH.', 'LIFT HILL. MY PANTS ARE SLOSHING.'],
  nude: ['UP THE HILL BARE-ASSED. CLICK CLICK.', 'LIFT HILL. WIND ON MY BALLS.'],
};
/** Over the top of the big drop. */
export const BIG_DROP: ByPants = {
  clean: ['YEAAAH!', 'BEST! RIDE! EVER!'],
  shitty: ['AAAAH! IT WENT UP MY BACK!', 'WOOO! THERE GOES MORE!'],
  nude: ['WOOOO! FLAPPING!', 'YEAAAH! EVERYTHING IS FLAPPING!'],
};
/** The ride photo's flash at the bottom. */
export const PHOTO: ByPants = {
  clean: ['I AM BUYING THAT PHOTO.', 'GOT MY GOOD SIDE.'],
  shitty: ['DO NOT SELL THAT PHOTO.', 'THAT PHOTO IS EVIDENCE.'],
  nude: ['THAT PHOTO IS GOING ON MY WALL.', 'I WANT THAT ON A KEYCHAIN.'],
};
/** The flume cut ahead of him, the log jumping it. */
export const BREAKOUT: ByPants = {
  clean: ['THAT IS NOT THE TRACK!', 'OFF THE RAILS! I LOVE IT!'],
  shitty: ['OFF THE TRACK, INTO THE SEWER. FITS.', 'WHERE ARE WE GOING?! OH. THE SEWER.'],
  nude: ['OFF THE TRACK! STILL NAKED!', 'NOT THE SEWER. NOT NAKED.'],
};
/** Down in the sewer. */
export const SEWER: ByPants = {
  clean: ['SEWER. SMELLS LIKE A PORTA-POTTY IN AUGUST.', 'THIS IS NOT PART OF THE RIDE.'],
  shitty: ['THE SEWER. FINALLY, I BLEND IN.', 'SMELLS LIKE MY PANTS DOWN HERE.'],
  nude: ['NAKED IN A SEWER. NEW LOW.', 'SEWER WATER. BARE ASS. GREAT.'],
};
/** Out of the culvert, out of the park, into a real river. */
export const REAL_RIVER: ByPants = {
  clean: ['PARK PROPERTY ENDS. GOOD.', 'A REAL RIVER. NO BOLTS IN THE ROCKS.'],
  shitty: ['OUT OF THE PARK. INTO A REAL RIVER. RINSE CYCLE.', 'REAL WATER. WASH ME.'],
  nude: ['REAL WILDERNESS. REAL NAKED.', 'OUT OF THE PARK. NO PANTS. NO RULES.'],
};
/** A real waterfall coming. */
export const FALLS: ByPants = {
  clean: ['A REAL WATERFALL! NO SAFETY BAR!', 'THIS ONE IS REAL! YEAAAH!'],
  shitty: ['REAL WATERFALL! REAL SHIT!', 'NOT AGAIN! NOT THE PANTS!'],
  nude: ['REAL WATERFALL! COLD BALLS!', 'NAKED OVER A WATERFALL! YEAH!'],
};
/** The woodchipper at the end of the river. */
export const CHIPPER_SEEN: ByPants = {
  clean: ['WOODCHIPPER. NOPE.', 'THE RIVER ENDS IN A WOODCHIPPER?!'],
  shitty: ['WOODCHIPPER. I AM NOT MULCH.', 'A WOODCHIPPER. SHAT AGAIN. A LITTLE.'],
  nude: ['WOODCHIPPER. NAKED. FEET FIRST. NO.', 'NOT THE CHIPPER. NOT WITH NO PANTS.'],
};
/** Out of the log, over the chipper, down on his feet. */
export const JUMPED: ByPants = {
  clean: ['NOT TODAY, CHIPPER.', 'BYE, LOG.'],
  shitty: ['MADE IT. THE LOG DIDN\'T.', 'MULCH THE LOG. NOT ME.'],
  nude: ['MADE IT. ALL MY PARTS.', 'STILL GOT EVERYTHING. CHECKED.'],
};

// ---------------------------------------------------------------------------------------------------------------
// What hurts him (by source), and the death screen when it's what killed him

export const HURT: HurtTable = {
  'm2:fr_saw': {
    hurt: ['SAW! SAW! SAW!', 'THE RIDE CUT ME!', 'BUZZSAW! IN MY MEAT!'],
    death: ['SAWED IN HALF ON A LOG RIDE', 'TIMBER TUMBLED', 'ARMS INSIDE. TORSO OUTSIDE.'],
  },
  'm2:fr_pipe': {
    hurt: ['PIPE! MY HEAD!', 'LOW PIPE! OW!', 'WHO PUTS A PIPE THERE?!'],
    death: ['HEADBUTTED A SEWER PIPE', 'CLOTHESLINED BY PLUMBING'],
  },
  'm2:fr_sewage': {
    hurt: ['SEWAGE! IN MY MOUTH!', 'IT IS NOT MINE! IT IS NOT MINE!', 'SOMEBODY FLUSHED!'],
    death: ['DROWNED IN THE PARK\'S SEWAGE', 'FLUSHED'],
  },
  'm2:fr_rock': {
    hurt: ['ROCK! THE LOG HIT A ROCK!', 'MY SPINE! MY WHOLE SPINE!', 'REAL ROCKS ARE HARD!'],
    death: ['DASHED ON THE ROCKS', 'THE REAL WILDERNESS GOT HIM'],
  },
  'm2:fr_chipper': {
    hurt: ['NOT THE CHIPPER! NOT THE CHIPPER!', 'MY FEET! MY LEGS! MY—'],
    death: ['MULCHED', 'WOODCHIPPED. FEET FIRST.', 'HE WAS NOT WOOD'],
  },
  'm2:fr_junk': {
    hurt: ['MY TAILBONE! A PIPE!', 'SEWER JUNK! RIGHT IN THE SPINE!', "WHAT DID WE HIT?! DON'T TELL ME."],
    death: ['BROKE HIS BACK ON SEWER JUNK', 'BUCKED OFF A SEWER LOG'],
  },
  'm2:fr_chainsaw': {
    hurt: ['CHAINSAW! CHAINSAW!', 'A LUMBERJACK SAWED ME!', 'NOT THE CHAINSAW!'],
    death: ['CUT DOWN BY THE CREW', 'FELLED BY A LOGGER', 'TIMBER'],
  },
};

const MEATHEAD = [DEAD_AGAIN, RIDE_START, FIRST_SAW, LIFT_HILL, BIG_DROP, PHOTO, BREAKOUT, SEWER, REAL_RIVER, FALLS, CHIPPER_SEEN, JUMPED];
const OPERATOR = [OP_CUT, OP_SHOVED, OP_AFTER, OP_AGAIN];
export const VOICE_LINES: Record<string, string[]> = {
  meathead: [...MEATHEAD.flatMap(allOf), ...Object.values(HURT).flatMap(h => h.hurt)],
  death: Object.values(HURT).flatMap(h => h.death),
  [TUCKER_VOICE]: [TUCKER_ENGAGE, TUCKER_SAWED].flatMap(allOf),
  [RIDE_VOICES.operator]: OPERATOR.flatMap(allOf),
  [RIDE_VOICES.operatorf]: OPERATOR.flatMap(allOf),
  [RIDE_VOICES.spiel]: [...SPIEL_CREEK, ...SPIEL_MILL, ...SPIEL_DROP, ...SPIEL_BUZZMODE],
  [RIDE_VOICES.crew]: [...allOf(CREW_JUMP), ...allOf(CREW_MAD)],
  [RIDE_VOICES.crewf]: [...allOf(CREW_JUMP), ...allOf(CREW_MAD)],
  announcer: CHIPPED_CALLS,
};
