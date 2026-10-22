// What's said on the train, by voice (frontier/voices.ts gathers it; tools/voices records it). In the user's voice:
// blunt, short, vulgar, specific; talk less; fit the trigger. Picked with pickLine. Meathead's lines in clean / shitty /
// naked pools; Tucker's (a boss's) the same for every line group. Pure data (tools/voices bundles it in node).
//
// Tucker on the speaking tube (the user's: his sin is GREED as indignant bookkeeping, South Park's Mel Gibson, "GIVE ME
// BACK MY 17 DOLLARS!"): one unpaid fare and he'll stop at nothing to collect. Ledger talk: the fare, plus interest,
// plus fees; nobody rides free; cheery-turned-manic, petty, never brooding.

import { TUCKER_VOICE, allOf, type ByPants, type HurtTable } from '../talk';

// ---------------------------------------------------------------------------------------------------------------
// Tucker, over the speaking tube

/** He's jumped on at the caboose: Tucker finds out, and THIS is the meltdown (the punch was a nuisance; the free ride
 *  is the crime). */
export const TUBE_BOARD: ByPants = {
  clean: ["YOU GOT ON MY TRAIN?! WITHOUT A TICKET?! FREELOADER! FREELOADER!", "PUNCH ME, FINE! BUT RIDE FOR FREE?! YOU CUT THE LINE, YOU SON OF A BITCH!"],
  shitty: ["YOU GOT ON MY TRAIN?! NO TICKET?! IN THOSE PANTS?! FREELOADER!", "PUNCH ME, FINE! BUT RIDE FREE?! AND SHIT IN MY CABOOSE?! THE FARE FIRST!"],
  nude: ["YOU GOT ON MY TRAIN?! NO TICKET?! NO PANTS?! THE TICKET IS WORSE!", "PUNCH ME, FINE! BUT RIDE FREE?! NAKED FREELOADER! I'LL BILL YOUR CORPSE!"],
};
/** Now and then, while he climbs forward: the ledger. */
export const TUBE_LEDGER: ByPants = {
  clean: [
    "ONE ADULT FARE. FOUR DOLLARS. PLUS INTEREST. IT'S COMPOUNDING.",
    "THAT'S SIX DOLLARS NOW. THE METER'S RUNNING, FRIEND.",
    'NOBODY RIDES FREE. NOT ON MY LINE. NOT EVER.',
    "YOU'RE IN THE LEDGER. IN RED INK.",
    "I NEVER HAD A WIFE. I HAD A LEDGER. IT NEVER LEFT ME.",
    'THIRTY YEARS. NOT ONE UNPAID FARE. NOT ONE!',
  ],
  shitty: [
    "FARE, PLUS INTEREST, PLUS UPHOLSTERY. YOU SAT IN IT, DIDN'T YOU.",
    'SEVEN DOLLARS. AND A DOLLAR FOR EVERY SEAT YOU SMEARED.',
    'NOBODY RIDES FREE. ESPECIALLY NOT WET.',
    "YOU'RE IN THE LEDGER. I HAD TO HOLD MY NOSE TO WRITE IT.",
    "EVERY CAR YOU WALK THROUGH NEEDS FUMIGATING. I'M BILLING EACH ONE.",
  ],
  nude: [
    'NO PANTS IS NOT A PAYMENT METHOD.',
    "SEVEN DOLLARS. YOU CAN'T HIDE IT. YOU CAN'T HIDE ANYTHING.",
    "NOBODY RIDES FREE. NOBODY RIDES NAKED. YOU'RE DOING BOTH.",
    "I'M WRITING YOU UP. UNDER INDECENT. AND UNPAID.",
    'EVERY SEAT YOUR BARE ASS TOUCHES IS A SURCHARGE.',
  ],
};
/** He's cutting loose the car Meathead's on (the tell, with the sparks and the clank). */
export const TUBE_UNCOUPLE: ByPants = {
  clean: ["THAT CAR'S FARE IS PAST DUE. CANCELLING IT.", "YOU'RE STANDING ON A CAR YOU HAVEN'T PAID FOR. NOT ANYMORE.", 'ACCOUNT CLOSED. THAT CAR GOES BACK.'],
  shitty: ["THAT CAR SMELLS LIKE YOU NOW. IT'S GOING.", "CANCELLING THAT CAR. I'LL NEVER GET THE SMELL OUT ANYWAY.", 'ACCOUNT CLOSED. TAKE YOUR STINK WITH IT.'],
  nude: ["THAT CAR'S BEEN SAT ON BARE. IT'S GOING.", 'CANCELLING THAT CAR. AND YOUR WHOLE NAKED ACCOUNT.', 'ACCOUNT CLOSED. SO ARE MY EYES.'],
};
/** He made it across anyway. */
export const TUBE_MISSED: ByPants = {
  clean: ["FINE. I'M BILLING YOU FOR THE CAR.", "THAT WAS A FOUR-HUNDRED-DOLLAR CAR. IT'S ON YOUR TAB.", "MY MOTHER'S ASHES WERE IN THAT CAR! THAT'S EXTRA!"],
  shitty: ["FINE. THE CAR'S ON YOUR TAB. SO IS THE SMELL.", "FOUR HUNDRED DOLLARS. I'M ROUNDING UP FOR THE STINK.", 'YOU WILL PAY FOR THAT CAR. IN CLEAN BILLS.'],
  nude: ["FINE. THE CAR'S ON YOUR TAB. WHERE DO YOU EVEN KEEP A WALLET?", "FOUR HUNDRED DOLLARS. I'LL TAKE A KIDNEY.", "YOU'LL PAY FOR THAT CAR. I'VE SEEN EVERYTHING YOU'VE GOT. IT'S NOT ENOUGH."],
};
/** The first tunnel. */
export const TUBE_TUNNEL: ByPants = {
  clean: ['TUNNEL. THE LIGHTS ARE EXTRA.', "IN THE DARK, IT'S STILL FOUR DOLLARS."],
  shitty: ['TUNNEL. THE LIGHTS ARE EXTRA. SO IS THE AIR FRESHENER.', 'IN THE DARK I CAN STILL SMELL WHERE YOU ARE.'],
  nude: ['TUNNEL. NOBODY HAS TO LOOK AT YOU FOR A MINUTE.', 'LIGHTS OUT. YOU STILL OWE ME.'],
};
/** The robbers ride up. */
export const TUBE_ROBBERS: ByPants = {
  clean: ["ROBBERS! THEY DIDN'T BUY TICKETS EITHER!", "BANDITS! I'M BILLING THEM TOO!"],
  shitty: ["ROBBERS! GOOD LUCK ROBBING HIM. HE'S GOT NOTHING BUT A LOAD.", "BANDITS! SHOOT THE SMELLY ONE FIRST!"],
  nude: ["ROBBERS! DON'T BOTHER WITH THE NAKED ONE. NO POCKETS.", 'BANDITS! I SAW HIM FIRST! HE OWES ME!'],
};
/** The first waterfall coming. */
export const TUBE_FALLS: ByPants = {
  clean: ["THE FALLS! PASSENGERS PLEASE STAY INSIDE. YOU'RE NOT A PASSENGER.", 'WATERFALL AHEAD! ENJOY YOUR SHOWER, FREELOADER!'],
  shitty: ['THE FALLS! FINALLY, SOMEBODY HOSES YOU OFF.', "WATERFALL AHEAD! IT WON'T BE ENOUGH."],
  nude: ['THE FALLS! A COLD SHOWER. YOU NEED ONE.', 'WATERFALL AHEAD! TRY NOT TO SHRINK TO NOTHING.'],
};
/** At the engine, the cutscene: he pops up out of the back of the cab and lays into him. */
export const TUCKER_INSULT: ByPants = {
  clean: [
    'YOU! YOU FREELOADING SACK OF HAM! EVERY CAR YOU TOUCHED IS A FARE!',
    'LOOK WHO CRAWLED UP MY TRAIN! A BIG DUMB MOOCHER WITH A NECK LIKE A THUMB!',
    'THE STOWAWAY! THE DEADBEAT! THE HUMAN UNPAID INVOICE!',
  ],
  shitty: [
    'YOU! YOU SHAT YOUR WAY DOWN MY WHOLE TRAIN! EVERY CAR A CLEANING FEE!',
    'THE STOWAWAY! THE DEADBEAT! THE WALKING DIAPER!',
    'I CAN SMELL YOU FROM THE CAB! YOU FREELOADING SEWER!',
  ],
  nude: [
    "YOU! NAKED! ON MY TENDER! THAT'S A FARE, A FINE, AND A SEAT CUSHION!",
    'THE STOWAWAY! THE DEADBEAT! THE BARE-ASSED FREELOADER!',
    'PUT IT AWAY! NO! FIRST PAY! THEN PUT IT AWAY!',
  ],
};
/** ...his kicker (the KILL arrow drops in after it). */
export const TUCKER_DARE: ByPants = {
  clean: ['GIVE ME MY FOUR DOLLARS! GIVE ME MY FOUR DOLLARS!', "FOUR DOLLARS! FOUR! I'LL TAKE IT OUT OF YOUR TEETH!"],
  shitty: ['GIVE ME MY FOUR DOLLARS! NOT FROM THOSE PANTS! FROM A WALLET!', "FOUR DOLLARS! I'LL TAKE IT OUT OF YOUR TEETH! THEY'RE THE ONLY CLEAN PART!"],
  nude: ["GIVE ME MY FOUR DOLLARS! I DON'T CARE WHERE YOU'RE KEEPING IT!", 'FOUR DOLLARS! AND COVER THAT THING!'],
};
/** He's ducked a special weapon (only the plain ray gun gets him). */
export const TUCKER_DODGE: ByPants = {
  clean: ['HA! NOT LEGAL TENDER!', "MISSED! THAT'S A SURCHARGE!", 'NO FANCY STUFF ON MY LINE!', "THAT'S MONOPOLY MONEY!"],
  shitty: ['HA! NOT LEGAL TENDER! NEITHER ARE YOUR PANTS!', "MISSED! THAT'S A SURCHARGE! AND A SMELL CHARGE!", 'NO FANCY STUFF! AND NO SHITTY STUFF!'],
  nude: ['HA! NOT LEGAL TENDER! NEITHER IS THAT!', 'MISSED! AIM WITH THE OTHER THING!', 'NO FANCY STUFF! NO PANTS! NO SERVICE!'],
};
/** At the engine: a charge move (a charge, a slide, an uppercut, a dive kick, a grab) at the cab: he slams the
 *  window's shutter in his face (the user's). */
export const TUCKER_SLAM: ByPants = {
  clean: ["WINDOW'S CLOSED!", 'NO PUNCHING THE STAFF!', 'HANDS OFF MY ENGINE!', 'TICKET WINDOW IS CLOSED!'],
  shitty: ["WINDOW'S CLOSED! YOU STINK!", 'NO PUNCHING THE STAFF! NO SHITTING IN THE CARS!', 'HANDS OFF! WASH THEM FIRST!'],
  nude: ["WINDOW'S CLOSED! KEEP YOUR WIENER OFF THE GLASS!", 'NO PUNCHING THE STAFF! NO PANTS EITHER!', 'HANDS OFF! AND KEEP THAT THING OFF TOO!'],
};
/** At the engine: his rant out of the cab (in order, one after the other: the KILL arrow's up the whole time). */
export const TUBE_RANT: ByPants = {
  clean: [
    "YOU MADE IT TO THE ENGINE. THAT'S TWENTY-TWO CARS. I CHARGE BY THE CAR.",
    'LET ME READ YOU THE LEDGER. FARE: FOUR DOLLARS. BOARDING FEE: TWO.',
    'FOUR CARS DERAILED: SIXTEEN HUNDRED. ONE CONDUCTOR, PUNCHED: I SET MY OWN RATE.',
    'PLUS INTEREST. AT MY RATE. WHICH IS ALL OF IT.',
    "I DON'T TAKE CHECKS. I DON'T TAKE CARDS. I TAKE WHAT I'M OWED!",
    'GIVE ME MY FOUR DOLLARS!',
  ],
  shitty: [
    "YOU MADE IT TO THE ENGINE. TWENTY-TWO CARS, AND YOU SAT IN EVERY ONE.",
    'THE LEDGER. FARE: FOUR DOLLARS. BOARDING FEE: TWO. BIOHAZARD: FIFTY.',
    'FOUR CARS DERAILED: SIXTEEN HUNDRED. THE ONES YOU SAT IN: I WANTED THOSE GONE.',
    "PLUS INTEREST. PLUS DRY CLEANING. MINE, NOT YOURS. YOURS IS HOPELESS.",
    "I DON'T TAKE CHECKS. I DON'T TAKE CARDS. I DON'T TAKE ANYTHING OUT OF THOSE PANTS!",
    'GIVE ME MY FOUR DOLLARS!',
  ],
  nude: [
    "YOU MADE IT TO THE ENGINE. TWENTY-TWO CARS, BUCK NAKED. I CHARGE BY THE CAR.",
    'THE LEDGER. FARE: FOUR DOLLARS. BOARDING FEE: TWO. INDECENCY: I HAVEN\'T DECIDED.',
    'FOUR CARS DERAILED: SIXTEEN HUNDRED. ONE CONDUCTOR, SCARRED FOR LIFE: PRICELESS.',
    'PLUS INTEREST. PUT SOMETHING ON AND WE CAN TALK.',
    "I DON'T TAKE CHECKS. I DON'T TAKE CARDS. WHERE WOULD YOU EVEN KEEP THEM?",
    'GIVE ME MY FOUR DOLLARS!',
  ],
};
/** Left too long at the engine: the tender goes too. */
export const TUBE_TIMEUP: ByPants = {
  clean: ["TIME'S UP. I'M CANCELLING THE TENDER. AND YOU ON IT."],
  shitty: ["TIME'S UP. THE TENDER GOES. YOU AND YOUR PANTS WITH IT."],
  nude: ["TIME'S UP. THE TENDER GOES. TAKE YOUR NAKED ASS WITH IT."],
};
/** Shot through the eye, in the close-up: his last words, gurgled. */
export const TUCKER_SHOT: ByPants = {
  clean: ['MY EYE... THAT\'S... EXTRA...', 'YOU\'LL... GET... AN INVOICE...'],
  shitty: ['MY EYE... AND THE SMELL... STILL...', 'I\'M BILLING... THE DRY... CLEANING...'],
  nude: ['MY EYE... AT LEAST... I CAN\'T SEE... YOUR DICK...', 'PUT... SOME PANTS... ON...'],
};

// ---------------------------------------------------------------------------------------------------------------
// Meathead

/** On, at the caboose. */
export const BOARDED: ByPants = {
  clean: ["GOT YOUR CABOOSE, TUCKER.", "I'M ON. WHERE'S THE ASSHOLE IN THE HAT?"],
  shitty: ['ON THE TRAIN. PANTS FULL. LET\'S GO.', 'I JUMPED A TRAIN WITH A LOAD IN MY PANTS. IT SHIFTED.'],
  nude: ['NAKED ON A TRAIN. THE WIND IS IN MY CRACK.', 'GOT THE CABOOSE. MY BALLS ARE FREEZING.'],
};
/** At the engine, the cutscene: his say back. */
export const MH_COMEBACK: ByPants = {
  clean: ["I'M NOT PAYING YOU FOUR BUCKS.", 'COME OUT HERE, YOU CHEAP LITTLE FUCK.', "YOU'RE GONNA NEED A BIGGER LEDGER."],
  shitty: ["I'LL PAY YOU IN WHAT'S IN MY PANTS.", "COME OUT HERE. I'LL HUG YOU."],
  nude: ['WHERE WOULD I EVEN KEEP FOUR BUCKS?', "COME OUT HERE. I'LL GIVE YOU A TIP."],
};
/** The first time Tucker ducks a special weapon: the plain gun, then. */
export const MH_RAYGUN: ByPants = {
  clean: ['HE DUCKS THE FANCY STUFF. RAY GUN, THEN.', 'FINE. THE PLAIN OLD RAY GUN.'],
  shitty: ['HE DUCKS THE FANCY STUFF. RAY GUN. SHIT.', 'FINE. RAY GUN. CLENCH AND AIM.'],
  nude: ['HE DUCKS ANYTHING FANCY. RAY GUN, IN THE BUFF.', 'FINE. THE RAY GUN. THE OTHER GUN STAYS OUT TOO.'],
};
/** Once each, the first time (by what): the first uncoupling survived, the cattle car, the first robber, the water
 *  tower, the first tunnel, the first waterfall. */
export const TRAIN_GAGS: Record<'cut' | 'cattle' | 'robbers' | 'tower' | 'tunnel' | 'falls', ByPants> = {
  falls: {
    clean: ['A WATERFALL. OVER THE TRACKS. GET INSIDE.'],
    shitty: ['A WATERFALL. TEMPTING. NO. INSIDE.'],
    nude: ['A WATERFALL. GET INSIDE BEFORE IT TAKES MY DICK.'],
  },
  cut: {
    clean: ['HE CUT THE CAR LOOSE. WITH ME ON IT.', "HE'D RATHER LOSE THE TRAIN THAN FOUR BUCKS."],
    shitty: ['HE DUMPED A WHOLE CAR TO GET RID OF ME. FAIR.', 'HE CUT ME LOOSE. I ALMOST SHAT. AGAIN.'],
    nude: ['HE CUT THE CAR LOOSE. MY ASS FELT THE BREEZE.', 'NAKED AND ALMOST DERAILED. GREAT DAY.'],
  },
  cattle: {
    clean: ["COWS. ON A TRAIN. THEY PAID. I DIDN'T."],
    shitty: ['A CATTLE CAR. FINALLY, A CAR THAT SMELLS WORSE THAN ME.'],
    nude: ['A CATTLE CAR. THE COWS ARE STARING AT MY DICK.'],
  },
  robbers: {
    clean: ['TRAIN ROBBERS. ROB TUCKER. PLEASE.'],
    shitty: ["ROB ME. THE ONLY THING I'M CARRYING IS IN MY PANTS."],
    nude: ['ROB ME. GO AHEAD. CHECK MY POCKETS.'],
  },
  tower: {
    clean: ['WATER TOWER. GET UNDER A ROOF.'],
    shitty: ['A WATER TOWER. HOSE ME DOWN. PLEASE.'],
    nude: ['WATER TOWER. COLD WATER. SHRINKAGE.'],
  },
  tunnel: {
    clean: ["CAN'T SEE SHIT IN HERE."],
    shitty: ["CAN'T SEE SHIT. CAN SMELL IT."],
    nude: ["DARK. GOOD. NOBODY CAN SEE MY DICK."],
  },
};
/** The engine: the KILL arrow over Tucker. */
export const KILL_SEEN: ByPants = {
  clean: ['THERE\'S AN ARROW. IT SAYS KILL. OKAY.', 'KILL. YEAH. THAT WAS THE PLAN.'],
  shitty: ['AN ARROW THAT SAYS KILL. FINALLY, SOME DIRECTIONS.', 'KILL. OKAY. THEN I\'M CHANGING MY PANTS.'],
  nude: ['IT SAYS KILL. I\'LL DO IT NAKED.', 'KILL ARROW. I DIDN\'T EVEN NEED A SIGN.'],
};
/** He's shot Tucker through the eye. */
export const SHOT_LINE: ByPants = {
  clean: ['TICKET PUNCHED.', 'KEEP THE CHANGE.'],
  shitty: ['TICKET PUNCHED. NOW I NEED A SHOWER.', 'THERE. PAID IN FULL.'],
  nude: ['TICKET PUNCHED. WITH MY BALLS OUT.', 'PAID. CASH. I DON\'T HAVE POCKETS.'],
};
/** ...then: nobody's driving. */
export const DRIVER_LINE: ByPants = {
  clean: ['WAIT. HE WAS DRIVING.', 'SO WHO STOPS THE TRAIN?'],
  shitty: ['WAIT. HE WAS DRIVING. OH, SHIT.', 'NO BRAKES. NO DRIVER. NO CLEAN PANTS.'],
  nude: ['WAIT. HE WAS DRIVING. AND I\'M NAKED.', 'NOBODY\'S DRIVING. HOLD ON TO SOMETHING. NOT THAT.'],
};
/** Back on the train after it's all over (a revisit: the train stood still, the cars recovered). */
export const REVISIT: ByPants = {
  clean: ['THEY FOUND THE CARS. HE BILLED ME FOR THE TOWING.'],
  shitty: ['THE TRAIN. STILL SMELLS LIKE ME.'],
  nude: ['THE TRAIN. I LEFT A BUTT PRINT ON EVERY SEAT.'],
};

// ---------------------------------------------------------------------------------------------------------------
// What hurts him on the train (by source), and the death screen when it's what killed him

export const HURT: HurtTable = {
  'm2:fr_falls': {
    hurt: ["THE WATER! IT'S TOO HEAVY!", "IT'S PUSHING ME OFF!", 'WATERFALL! WATERFALL!'],
    death: ['SWEPT OFF BY A WATERFALL', "SHOULD'VE GONE INSIDE", 'SHOWERED ON A TRAIN. DIED.'],
  },
  'm2:fr_derail': {
    hurt: ['IT\'S GOING! IT\'S GOING!', 'THE CAR\'S LOOSE! THE CAR\'S LOOSE!'],
    death: ['BLOWN UP. STILL ON THE CAR.', 'CANCELLED WITH THE CAR', 'FOUR-DOLLAR FARE. ONE WAY.'],
  },
  'm2:fr_tracks': {
    hurt: ['THE TRACKS! THE TRACKS!', 'UNDER THE WHEELS!'],
    death: ['RUN OVER BY HIS OWN TRAIN', 'DICED BETWEEN THE CARS'],
  },
  'm2:fr_bridge': {
    hurt: ['BRIDGE! FACE!', 'LOW BRIDGE! I DIDN\'T DUCK!', 'WHO BUILDS A BRIDGE THAT LOW?!'],
    death: ['CLOTHESLINED BY A BRIDGE', 'THE BRIDGE DIDN\'T DUCK'],
  },
  'm2:fr_spout': {
    hurt: ['WATER! COLD WATER!', 'THE WATER TOWER GOT ME!', 'IT\'S IN MY EARS!'],
    death: ['HOSED OFF BY A WATER TOWER', 'DROWNED STANDING ON A TRAIN'],
  },
  'm2:fr_coal': {
    hurt: ['COAL! HOT COAL!', 'A ROCK! A BURNING ROCK!', 'HE THREW COAL AT ME!'],
    death: ['STONED TO DEATH WITH COAL', 'NAUGHTY LIST. LUMP OF COAL.'],
  },
  'm2:fr_cinder': {
    hurt: ['EMBERS! IN MY HAIR!', 'MY ASS HAIR\'S ON FIRE!', 'THE SMOKESTACK\'S SPITTING!'],
    death: ['BURNED UP BY SPARKS', 'THE SMOKESTACK GOT HIM'],
  },
  'm2:fr_porter': {
    hurt: ['THE PORTER HIT ME!', 'WITH A SUITCASE!', 'I DON\'T TIP!'],
    death: ['BEATEN TO DEATH BY A PORTER', 'HE DIDN\'T TIP THE PORTER'],
  },
  'm2:fr_suitcase': {
    hurt: ['SUITCASE! TO THE HEAD!', 'SOMEBODY\'S CRUSTY UNDERWEAR! IN MY MOUTH!', 'LUGGAGE! INCOMING!'],
    death: ['KILLED BY CHECKED LUGGAGE', 'BURIED IN SOMEONE\'S SUITCASE'],
  },
  'm2:fr_brakeman': {
    hurt: ['HE CLUBBED ME!', 'THE BRAKEMAN! WITH A STICK!', 'MY HEAD! MY STUPID HEAD!'],
    death: ['CLUBBED BY A BRAKEMAN', 'THE BRAKEMAN BRAKED HIM'],
  },
  'm2:fr_robber': {
    hurt: ['HE PISTOL WHIPPED ME!', 'HIS BREATH! HIS BREATH IS WORSE!', 'RIGHT IN THE TEETH!'],
    death: ['BEATEN BY A TRAIN ROBBER', 'ROBBED. OF HIS LIFE.'],
  },
  'm2:fr_robber_shot': {
    hurt: ['I\'M SHOT! BY A COWBOY!', 'HE SHOT ME OFF A HORSE!', 'BANDITS! SHOOTING!'],
    death: ['SHOT BY A TRAIN ROBBER', 'GUNNED DOWN ON A TRAIN ROOF'],
  },
  'm2:fr_cook': {
    hurt: ['THE COOK! WITH A PAN!', 'FRYING PAN! TO THE FACE!', 'I DIDN\'T ORDER THAT!'],
    death: ['PANNED TO DEATH BY THE COOK', 'THE COOK SERVED HIM'],
  },
  'm2:fr_cleaver': {
    hurt: ['CLEAVER! CLEAVER!', 'HE THREW A KNIFE! A BIG ONE!', 'MY ARM! MY MEAT!'],
    death: ['CLEAVED BY THE COOK', 'CHOPPED UP IN THE DINING CAR'],
  },
  'm2:fr_passenger': {
    hurt: ['SHE POKED ME!', 'THE OLD MAN HIT ME!', 'HER PURSE IS FULL OF DIMES!'],
    death: ['POKED TO DEATH BY GRANDMA', 'KILLED BY A PAYING CUSTOMER'],
  },
  'm2:fr_parasol': {
    hurt: ['I CHARGED A PARASOL! IT STABS!', 'OW! THE POINTY END!', 'SKEWERED BY AN UMBRELLA!'],
    death: ['SHOULDER CHARGED A PARASOL', 'SKEWERED ON AN UMBRELLA'],
  },
  'm2:fr_steer': {
    hurt: ['THE COW RAMMED ME!', 'STEER! STEER!', 'THAT\'S A LOT OF BEEF!'],
    death: ['TRAMPLED IN A CATTLE CAR', 'THE BEEF WON'],
  },
  'm2:fr_longhorns': {
    hurt: ['HORNS! I CHARGED THE HORNS!', 'LONGHORNS! IN MY GUT!', 'WHY DID I CHARGE A COW?!'],
    death: ['SHOULDER CHARGED A LONGHORN', 'GORED IN A CATTLE CAR'],
  },
  'm2:fr_fireman': {
    hurt: ['THE FIREMAN! WITH A SHOVEL!', 'SHOVEL TO THE FACE!', 'HE SHOVELED ME LIKE SHIT!'],
    death: ['SHOVELED TO DEATH', 'THE FIREMAN STOKED HIM'],
  },
};

export const VOICE_LINES: Record<string, string[]> = {
  meathead: [
    ...allOf(BOARDED), ...Object.values(TRAIN_GAGS).flatMap(allOf), ...allOf(KILL_SEEN), ...allOf(SHOT_LINE), ...allOf(DRIVER_LINE), ...allOf(REVISIT),
    ...allOf(MH_COMEBACK), ...allOf(MH_RAYGUN),
    ...Object.values(HURT).flatMap(h => h.hurt),
  ],
  death: Object.values(HURT).flatMap(h => h.death),
  [TUCKER_VOICE]: [TUBE_BOARD, TUBE_LEDGER, TUBE_UNCOUPLE, TUBE_MISSED, TUBE_TUNNEL, TUBE_ROBBERS, TUBE_FALLS, TUCKER_INSULT, TUCKER_DARE, TUCKER_DODGE, TUCKER_SLAM, TUBE_RANT, TUBE_TIMEUP, TUCKER_SHOT].flatMap(allOf),
};
