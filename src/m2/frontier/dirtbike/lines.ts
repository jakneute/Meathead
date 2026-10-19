// What's said in the dirt-bike chase (the TEENAGERS sub-boss), by voice (frontier/voices.ts gathers it; tools/voices
// records it). In the user's voice: blunt, short, vulgar, specific; talk less; fit the trigger. Picked with pickLine
// (no line twice in 45 s). Meathead's, Tucker's and the teens' lines in clean / shitty / naked pools (the teens and
// Tucker react to the state of him). Pure data (tools/voices bundles it in node).
//
// The teens talk in the woods' four voices (woods/lines.ts TEEN_VOICES); Tucker in his (talk.ts TUCKER_VOICE).

import { allOf, TUCKER_VOICE, type ByPants, type HurtTable } from '../talk';
import { TEEN_VOICES } from '../woods/lines';

// ---------------------------------------------------------------------------------------------------------------
// Meathead

/** Off he goes, the pack behind him (the first time in a visit). */
export const MH_START: ByPants = {
  clean: ['COME GET YOUR TWENTY BUCKS, ZIT FACES.', 'LET\'S RIDE, PUNKS.'],
  shitty: ['COME ON. I\'LL SKID MARK ALL OF YOU.', 'RIDING IN A FULL DIAPER. LET\'S GO.'],
  nude: ['NAKED ON A DIRT BIKE. THIS SEAT IS HOT.', 'COME ON, PUNKS. NOTHING BETWEEN ME AND THIS SEAT.'],
};
/** Back on the bike after dying (not every time: now and then). */
export const MH_AGAIN: ByPants = {
  clean: ['ROUND TWO, ZIT FACES.', 'I\'M BACK. HIDE YOUR ALLOWANCE.'],
  shitty: ['ROUND TWO. STILL SHITTY.', 'BACK ON THE BIKE. SEAT\'S STILL WARM. AND WET.'],
  nude: ['ROUND TWO. STILL NAKED.', 'BACK ON. SEAT STICKS TO MY ASS.'],
};
/** A teen knocked off with plain punches (now and then). */
export const MH_KNOCKOFF: ByPants = {
  clean: ['NEXT.', 'GO HOME TO YOUR MOM.', 'GET A JOB.'],
  shitty: ['SMELL THAT ON THE WAY DOWN.', 'NEXT. HOLD YOUR NOSE.'],
  nude: ['NEXT. EYES UP HERE.', 'GO TELL YOUR MOM WHAT YOU SAW.'],
};

/** The punch parries, one pool per weapon (said about half the time). */
export const MH_PARRY: Record<string, ByPants> = {
  chain: {
    clean: ['RETURN TO SENDER.', 'HUMAN BOMB.'],
    shitty: ['SPLAT. LIKE MY PANTS.', 'BOOM. THAT\'S HOW MY PANTS WENT.'],
    nude: ['BOOM. NAKED GUY MAGIC.', 'FIREWORKS. AND I\'M NAKED.'],
  },
  bat: {
    clean: ['BATTER UP. INTO A TREE.', 'HOME RUN.'],
    shitty: ['YOU SWING LIKE MY BOWELS.', 'STRIKE THREE. YOU\'RE A TREE NOW.'],
    nude: ['NICE BAT. MINE\'S BIGGER.', 'YOU\'RE OUT. IN A TREE.'],
  },
  crowbar: {
    clean: ['EAT DIRT.', 'YOUR FRIENDS GOT YOU.'],
    shitty: ['FACE DOWN. I KNOW THE FEELING.', 'YOUR OWN PACK RAN YOU OVER. TEAMWORK.'],
    nude: ['FACE IN THE DIRT, ASS IN THE AIR. WELCOME TO MY DAY.', 'EAT DIRT, KID.'],
  },
  nunchucks: {
    clean: ['STRIKE!', 'BOWLING NIGHT.'],
    shitty: ['STRIKE. SHIT HAPPENS.', 'BOWLED OVER. LIKE MY STOMACH.'],
    nude: ['STRIKE. NAKED BOWLING.', 'ROLL OUT, KID.'],
  },
  hockey: {
    clean: ['THANKS FOR THE RAMP.', 'SPEED BUMP.'],
    shitty: ['SORRY ABOUT YOUR BACK. AND MY PANTS.', 'HUMAN RAMP. SKID MARK INCLUDED.'],
    nude: ['HUMAN RAMP. MY BALLS WENT AIRBORNE.', 'THANKS FOR THE LIFT, KID.'],
  },
  skateboard: {
    clean: ['SKATE OR DIE.', 'WATCH OUT FOR THE COW.'],
    shitty: ['SKATE OR DIE. YOU PICKED DIE.', 'NICE BOARD. NOW YOU\'RE WEARING IT.'],
    nude: ['SKATE OR DIE. NAKED EDITION.', 'HEADS UP. COW.'],
  },
};

/** The last teen down: Tucker's off into the trees and he goes after him (the end of the chase). */
export const MH_END: ByPants = {
  clean: ['HEY, BUZZSAW! WHERE\'S MY TWENTY BUCKS?'],
  shitty: ['HEY, BUZZSAW! SMELL THAT? I\'M RIGHT BEHIND YOU!'],
  nude: ['HEY, BUZZSAW! NAKED AND RIGHT BEHIND YOU!'],
};

// ---------------------------------------------------------------------------------------------------------------
// The teens

/** Pulling up alongside him (now and then). */
export const TEEN_TAUNT: ByPants = {
  clean: ['TWENTY BUCKS, OLD MAN!', 'HOLD STILL, GRANDPA!', 'YOUR HEAD\'S MINE!', 'I NEED THIS TWENTY!'],
  shitty: ['HE SMELLS LIKE A DIAPER!', 'EW! HE SHAT HIS JEANS!', 'I\'M NOT TOUCHING HIS PANTS!', 'TWENTY BUCKS ISN\'T ENOUGH FOR THIS SMELL!'],
  nude: ['HE\'S NAKED ON A BIKE!', 'I CAN SEE HIS BALLS FLAPPING!', 'AIM FOR THE HEAD! NOT DOWN THERE!', 'PUT IT AWAY, MAN!'],
};
/** Parried: the yelp on the way to whatever he does to them. */
export const TEEN_PARRIED: ByPants = {
  clean: ['MOM!', 'NOT FAIR!', 'OH NO OH NO!', 'I WANT MY MOM!'],
  shitty: ['NOT THE SHIT HAND!', 'HE TOUCHED ME WITH THE SHIT HAND!', 'EW! EW! EW!'],
  nude: ['HE TOUCHED ME NAKED!', 'NOT THE NAKED GUY!', 'HIS THING TOUCHED MY LEG!'],
};

// ---------------------------------------------------------------------------------------------------------------
// Tucker (glimpsed ahead on his stolen bike, out of reach)

/** Each stretch, the bounty goes up. */
export const TUCKER_RAISE: ByPants = {
  clean: ['FORTY BUCKS! FORTY BUCKS FOR HIS HEAD!', 'FIFTY BUCKS! PLUS TAX!', 'A HUNDRED BUCKS! I\'LL PUT IT ON HIS TAB!', 'EIGHTY BUCKS AND A FREE TRAIN RIDE!'],
  shitty: ['FORTY BUCKS! I\'LL THROW IN A CLOTHESPIN!', 'FIFTY BUCKS! HOSE THE HEAD OFF FIRST!', 'A HUNDRED BUCKS! BRING IT IN A BUCKET!'],
  nude: ['FORTY BUCKS! FIFTY IF YOU PUT PANTS ON HIM!', 'A HUNDRED BUCKS! DON\'T LOOK DOWN, CHILDREN!', 'FIFTY BUCKS! JUST THE HEAD! LEAVE THE REST!'],
};
/** The ledger, yelled back over his shoulder. */
export const TUCKER_LEDGER: ByPants = {
  clean: ['ONE FARE! PLUS INTEREST! PLUS THIS BIKE!', 'NOBODY RIDES FREE! NOT EVEN ON A STOLEN BIKE!', 'I\'M BILLING YOU FOR THESE CHILDREN!'],
  shitty: ['ONE FARE! PLUS CLEANING FEES!', 'NOBODY RIDES FREE! ESPECIALLY NOT SOILED!', 'I\'M BILLING YOU FOR THAT SMELL!'],
  nude: ['ONE FARE! PLUS A DECENCY FINE!', 'NOBODY RIDES FREE! NOT NAKED! NOT EVER!', 'I\'M BILLING YOU FOR PANTS!'],
};
/** The last teen down: his bounty's gone, and off he goes into the trees. */
export const TUCKER_FLEE: ByPants = {
  clean: ['MY BOUNTY! MY WHOLE BOUNTY!'],
  shitty: ['MY BOUNTY! AND HE STILL STINKS!'],
  nude: ['MY BOUNTY! AND HE\'S STILL NAKED!'],
};

// ---------------------------------------------------------------------------------------------------------------
// What hurts him out here: the bails (by what he rode into), the teens' weapons, a loose bike, his own human bomb

export const HURT: HurtTable = {
  'm2:fr_bail_tree': {
    hurt: ['TREE!', 'FACE, MEET BARK!', 'WHO PUT A TREE THERE?!'],
    death: ['WRAPPED AROUND A TREE', 'HUGGED A TREE AT 40 MPH'],
  },
  'm2:fr_bail_post': {
    hurt: ['MAILBOX! IN MY TEETH!', 'FENCE POST TO THE NUTS!', 'READ THE SIGN! WITH MY FACE!'],
    death: ['READ A SIGN UP CLOSE', 'MAILBOXED. RETURN TO SENDER.'],
  },
  'm2:fr_bail_cow': {
    hurt: ['COW! COW! COW!', 'I HIT A COW! IT HIT BACK!', 'MOO TO YOU TOO!'],
    death: ['KILLED BY A COW HE KILLED', 'HIT A COW. NOBODY WON.'],
  },
  'm2:fr_bail_deer': {
    hurt: ['DEER! RIGHT IN MY FACE!', 'BAMBI! NO!', 'ANTLER IN MY ASS!'],
    death: ['DEER IN THE HEADLIGHTS. HIM.', 'TAKEN OUT BY BAMBI'],
  },
  'm2:fr_bail_hay': {
    hurt: ['HAY BALE! NOT SOFT!', 'HAY! IN EVERY HOLE!'],
    death: ['A ROLL IN THE HAY. FATAL.', 'HAY BALES ARE NOT SOFT'],
  },
  'm2:fr_bail_outhouse': {
    hurt: ['OUTHOUSE! I\'M IN IT!', 'SOMEBODY WAS IN THERE!', 'COVERED IN IT! SOMEBODY ELSE\'S!'],
    death: ['DIED IN AN OUTHOUSE', 'DIED IN SOMEONE ELSE\'S SHIT'],
  },
  'm2:fr_bail_tractor': {
    hurt: ['TRACTOR! PARKED! WHY?!', 'FARM EQUIPMENT! MY SPINE!'],
    death: ['RAN INTO A PARKED TRACTOR', 'THE TRACTOR WASN\'T EVEN ON'],
  },
  'm2:fr_bail_rock': {
    hurt: ['ROCK! MY TAILBONE!', 'JUMP THE ROCKS, DUMBASS!'],
    death: ['FLIPPED ON A ROCK', 'ROCK ONE. MEATHEAD ZERO.'],
  },
  'm2:fr_bail_log': {
    hurt: ['LOG! IN MY CROTCH!', 'SHOULD HAVE JUMPED THAT LOG!'],
    death: ['TRIPPED ON A LOG AT 40 MPH', 'STOPPED DEAD BY A LOG'],
  },
  'm2:fr_bail_creek': {
    hurt: ['CREEK! THAT WAS A JUMP!', 'WATER! UP MY NOSE!'],
    death: ['DROWNED ON A DIRT BIKE', 'SHOULD HAVE JUMPED THE CREEK'],
  },
  'm2:fr_bail_pylon': {
    hurt: ['POWER LINE TOWER! I\'M BUZZING!', 'STEEL! MY FACE!'],
    death: ['HIT A POWER TOWER. SHOCKING.', 'FLATTENED ON A POWER TOWER'],
  },
  'm2:fr_chain': {
    hurt: ['BIKE CHAIN! MY FACE!', 'GREASE IN MY EYE!', 'OW! CHAIN LINK FACE!'],
    death: ['WHIPPED WITH A BIKE CHAIN', 'TWENTY BUCKS OF BIKE CHAIN'],
  },
  'm2:fr_bat': {
    hurt: ['BAT TO THE HEAD!', 'OW! IT\'S ALUMINUM!', 'MY SKULL! BATTER UP!'],
    death: ['BATTED TO DEATH BY A KID', 'HOME RUN. WITH HIS HEAD.'],
  },
  'm2:fr_crowbar': {
    hurt: ['CROWBAR! MY KIDNEY!', 'OW! THAT\'S A TOOL, KID!'],
    death: ['CROWBARRED BY A TEENAGER', 'PRIED OFF HIS BIKE'],
  },
  'm2:fr_nunchucks': {
    hurt: ['NUNCHUCKS?! WHAT YEAR IS IT?!', 'OW! MY EAR!'],
    death: ['NUNCHUCKED TO DEATH', 'A KID SAW ONE KUNG FU MOVIE'],
  },
  'm2:fr_hockey': {
    hurt: ['HOCKEY STICK! MY TEETH!', 'HIGH STICKING! PENALTY!'],
    death: ['HIGH STICKED TO DEATH', 'CHECKED INTO THIN AIR'],
  },
  'm2:fr_skateboard': {
    hurt: ['SKATEBOARD! TO THE FACE!', 'GRIP TAPE! MY CHEEK!'],
    death: ['KILLED BY A SKATEBOARD', 'SKATE OR DIE. HE DIED.'],
  },
  'm2:fr_bikewreck': {
    hurt: ['LOOSE BIKE! MY SHINS!', 'EMPTY BIKE! IN MY NUTS!'],
    death: ['HIT BY A BIKE. NOBODY ON IT.', 'RUN OVER BY AN EMPTY BIKE'],
  },
  'm2:fr_teenbomb': {
    hurt: ['HOT! KID BITS! HOT!', 'I\'M COVERED IN TEENAGER!', 'THERE\'S BRACES IN MY HAIR!'],
    death: ['RODE INTO HIS OWN HUMAN BOMB', 'BLOWN UP BY A TEEN HE THREW'],
  },
};

const MEATHEAD = [MH_START, MH_AGAIN, MH_KNOCKOFF, MH_END, ...Object.values(MH_PARRY)];
const teenLines = [TEEN_TAUNT, TEEN_PARRIED].flatMap(allOf);
export const VOICE_LINES: Record<string, string[]> = {
  meathead: [...MEATHEAD.flatMap(allOf), ...Object.values(HURT).flatMap(h => h.hurt)],
  death: Object.values(HURT).flatMap(h => h.death),
  [TUCKER_VOICE]: [TUCKER_RAISE, TUCKER_LEDGER, TUCKER_FLEE].flatMap(allOf),
  ...Object.fromEntries([...TEEN_VOICES.boy, ...TEEN_VOICES.girl].map(v => [v, teenLines])),
};
