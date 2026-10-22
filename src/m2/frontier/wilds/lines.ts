// What's said in the frontier wilds and at the station, by voice (frontier/voices.ts gathers it; tools/voices records
// it). In the user's voice: blunt, short, vulgar, specific; talk less; fit the trigger. Picked with pickLine. Meathead's
// own lines in clean / shitty / naked pools; Tucker's (a boss's) the same for every line group. Pure data.
//
// Tucker (the user's inspiration: a character in Cannibal! The Musical who just can't seem to die): cheery, chipper,
// a railroad man in love with his newfangled railroad. His sin is GREED as indignant bookkeeping (the user's: South
// Park's Mel Gibson, GIVE ME BACK MY 17 DOLLARS): one unpaid fare consumes him; manic, petty, cheery-turned-unhinged,
// ledger talk (the fare, plus interest; nobody rides free; he doesn't give handouts), never brooding. The user's lines
// are verbatim in his pools ("NO ONE BOARDS MY TRAIN WITHOUT A TICKET!").

import { TUCKER_VOICE, allOf, type ByPants, type HurtTable } from '../talk';

// ---------------------------------------------------------------------------------------------------------------
// Meathead, along the way (once each)

export const ARRIVE: ByPants = {
  clean: ['WILDERNESS LAND. THE ROCKS HAVE BOLTS IN THEM.', 'EVERY TREE HAS A SPEAKER IN IT PLAYING BIRDS.'],
  shitty: ['THE FRONTIER. PIONEERS SHAT THEIR PANTS TOO. I FIT RIGHT IN.', 'OLD AMERICA. SMELLS LIKE ME.'],
  nude: ['THE FRONTIER. NAKED AS THE DAY THE PIONEERS MADE ME.', 'WILDERNESS LAND. I DRESSED FOR IT.'],
};
export const GAGS: Record<'trap' | 'log' | 'wolves' | 'leeches' | 'rapids' | 'bison' | 'falls' | 'tracks', ByPants> = {
  leeches: {
    clean: ['LEECHES. I\'M STAYING ON THE LOG.'],
    shitty: ['LEECHES. THEY\'D GO STRAIGHT FOR MY PANTS.'],
    nude: ['LEECHES. AND EVERYTHING I OWN IS HANGING OUT.'],
  },
  trap: {
    clean: ['A BEAR TRAP. ON THE PATH. FOR THE GUESTS.'],
    shitty: ['A BEAR TRAP. GREAT. ONE MORE THING TO STEP IN.'],
    nude: ['A BEAR TRAP. AND MY BALLS ARE OUT. COOL.'],
  },
  log: {
    clean: ['A LOG IN A POND. I AM A LUMBERJACK NOW.'],
    shitty: ['A LOG. I KNOW ALL ABOUT LOGS TODAY.'],
    nude: ['NAKED LOG ROLLING. MOM WOULD BE SO PROUD.'],
  },
  wolves: {
    clean: ['WOLVES. GOOD. I NEED THE CARDIO.'],
    shitty: ['WOLVES. THEY CAN SMELL ME. EVERYTHING CAN SMELL ME.'],
    nude: ['WOLVES. DO NOT GO FOR THE DANGLY BITS.'],
  },
  rapids: {
    clean: ['RAPIDS. ON A LOG. NO HELMET. LET\'S GO.'],
    shitty: ['RAPIDS. AT LEAST THE WATER WILL WASH MY PANTS.'],
    nude: ['WHITE WATER. NAKED. MY BALLS ARE HITTING EVERY ROCK.'],
  },
  bison: {
    clean: ['A BUFFALO. ITS BALLS ARE BIGGER THAN MY HEAD.'],
    shitty: ['A BUFFALO. IT SMELLS WORSE THAN ME. BARELY.'],
    nude: ['A BUFFALO. DO NOT LOOK AT ME, BUFFALO.'],
  },
  falls: {
    clean: ['A WATERFALL AT THE END. GET OFF BEFORE IT. GOT IT.'],
    shitty: ['A WATERFALL. IF I GO OVER, I GO OVER CLEAN.'],
    nude: ['A WATERFALL. NOTHING LEFT TO LOSE. EXCEPT THE TWINS.'],
  },
  tracks: {
    clean: ['RAILROAD TRACKS. A TRAIN. FINALLY, A SEAT.'],
    shitty: ['A TRAIN. A TRAIN HAS A BATHROOM. PLEASE HAVE A BATHROOM.'],
    nude: ['A TRAIN STATION. NOBODY CHECKS FOR PANTS ON A TRAIN.'],
  },
};

// ---------------------------------------------------------------------------------------------------------------
// The station: Tucker and Meathead (each group's pools by the state of Meathead)

/** Tucker sees him coming. */
export const TUCKER_GREET: ByPants = {
  clean: ['WELL, HOWDY THERE, TRAVELER! WELCOME TO LONESOME PINE STATION!', 'HOWDY, FRIEND! RIGHT ON TIME! THE TRAIN ALWAYS IS!'],
  shitty: ['HOWDY, TRAVELER! WHEW! LONG TRAIL, HUH? SMELLS LIKE IT!', 'HOWDY, FRIEND! THE OUTHOUSE IS OUT BACK! A LITTLE LATE NOW!'],
  nude: ['HOWDY, TRAV... OH! WELL! THE FRONTIER IS HARD ON A FELLA\'S TROUSERS!', 'HOWDY, FRIEND! I SEE THE WOLVES GOT YOUR CLOTHES!'],
};
/** Tucker's pitch: the newfangled railroad to Sawdust Gulch. */
export const TUCKER_PITCH: ByPants = {
  clean: ['ALL ABOARD FOR SAWDUST GULCH! MINING! LOGGING! THESE NEWFANGLED RAILROAD TRACKS GET YOU THERE IN A JIFFY!', 'SAWDUST GULCH, ONE STOP! THESE NEWFANGLED RAILROAD TRACKS! A WHOLE DAY\'S RIDE IN TWENTY MINUTES!'],
  shitty: ['ALL ABOARD FOR SAWDUST GULCH! THESE NEWFANGLED RAILROAD TRACKS GET YOU THERE IN A JIFFY! YOU CAN SIT IN THE CABOOSE!'],
  nude: ['ALL ABOARD FOR SAWDUST GULCH! THESE NEWFANGLED RAILROAD TRACKS GET YOU THERE IN A JIFFY! WE\'LL FIND YOU A BLANKET!'],
};
/** TICKET, PLEASE (the hand out). */
export const TUCKER_TICKET: ByPants = {
  clean: ['TICKET, PLEASE!'],
  shitty: ['TICKET, PLEASE! HOLD IT BY THE CORNER!'],
  nude: ['TICKET, PLEASE! WHEREVER YOU KEEP IT. I DON\'T WANT TO KNOW.'],
};
/** Meathead: no ticket. */
export const NO_TICKET: ByPants = {
  clean: ['TICKET? I\'VE GOT A FIST.', 'I DON\'T PAY FOR SHIT. ASK MY EX.'],
  shitty: ['MY TICKET\'S IN MY PANTS. YOU DON\'T WANT IT.', 'NO TICKET. I\'VE GOT A LOAD, THOUGH.'],
  nude: ['DO I LOOK LIKE I HAVE POCKETS?', 'WHERE WOULD I PUT A TICKET?'],
};
/** Tucker, while he's in the way at the gate (now and then, till he's hit). */
export const TUCKER_BLOCK: ByPants = {
  clean: ['NO TICKET, NO TRAIN, FRIEND!', 'TICKETS AT THE WINDOW! WHICH IS CLOSED!', 'ONE FARE. FOUR DOLLARS. I KEEP A LEDGER, FRIEND.'],
  shitty: ['NO TICKET, NO TRAIN! AND NO SMELL LIKE THAT EITHER!', 'TICKETS AT THE WINDOW! WIPE FIRST!'],
  nude: ['NO TICKET, NO TRAIN! NO PANTS, NO... WELL, ALSO NO TRAIN!', 'TICKETS AT THE WINDOW! COVER UP FIRST!'],
};
/** Punched: on his backside (a yelp: put out, not hurt). */
export const TUCKER_OOF: ByPants = {
  clean: ['OOF! WELL, THAT\'S RUDE.', 'OOF! MY SPECTACLES. HONESTLY.'],
  shitty: ['OOF! IT\'S ON YOUR HANDS!', 'OOF! IT\'S ON MY VEST! THIS IS FELT!'],
  nude: ['OOF! YOU\'RE TOUCHING ME WITH THAT?!', 'OOF! PUT IT AWAY!'],
};
/** The close-up, dusting himself off: the user's line, every pool. A warning, not yet the meltdown (that's when he
 *  finds out Meathead got on anyway: train/lines.ts TUBE_BOARD). */
export const TUCKER_RAGE: ByPants = {
  clean: ['NO ONE BOARDS MY TRAIN WITHOUT A TICKET!', 'NO ONE BOARDS MY TRAIN WITHOUT A TICKET! WRITE THAT DOWN.'],
  shitty: ['NO ONE BOARDS MY TRAIN WITHOUT A TICKET! OR WITH A LOAD IN HIS PANTS!'],
  nude: ['NO ONE BOARDS MY TRAIN WITHOUT A TICKET! OR WITHOUT PANTS!'],
};
/** Off to his engine, huffy: the punch is a nuisance; he has a schedule. */
export const TUCKER_RUN: ByPants = {
  clean: ['ASSAULT. ON MY PLATFORM. I HAVE A SCHEDULE!', 'PUNCHED. WONDERFUL. AND NOW I\'M LATE!'],
  shitty: ['PUNCHED BY A STINKY MAN. AND NOW I\'M LATE!', 'I HAVE TO WASH MY FACE! I\'M BEHIND SCHEDULE!'],
  nude: ['PUNCHED BY A NAKED MAN. AND NOW I\'M LATE!', 'I DON\'T HAVE TIME FOR THIS! OR FOR THAT!'],
};
/** From the cab, pulling out (prim: the window's that way). */
export const TUCKER_CAB: ByPants = {
  clean: ['ALL ABOARD! EXCEPT YOU! TICKETS ARE FOUR DOLLARS! AT THE WINDOW!', 'I DON\'T GIVE HANDOUTS! IT\'S ALL IN THE LEDGER!'],
  shitty: ['ALL ABOARD! EXCEPT STINKY! TICKETS ARE FOUR DOLLARS! BATHS ARE EXTRA!'],
  nude: ['ALL ABOARD! EXCEPT THE NAKED MAN! TICKETS ARE FOUR DOLLARS! PANTS ARE REQUIRED!'],
};
/** Meathead, the train pulling away: after it. */
export const CHASE: ByPants = {
  clean: ['OH, IT\'S ON, CHOO-CHOO.', 'GET BACK HERE, YOU FOUR-EYED DICK.'],
  shitty: ['I\'M CATCHING THAT TRAIN IF I HAVE TO SHIT MY WAY THERE.'],
  nude: ['NAKED TRAIN ROBBERY. HERE WE GO.'],
};
/** Back at the station later (the train long gone). */
export const STATION_EMPTY = ['NO TRAIN. JUST A BELL. I\'M RINGING IT.'];

// ---------------------------------------------------------------------------------------------------------------
// What hurts him in the wilds (by source), and the death screen when it's what killed him

export const HURT: HurtTable = {
  'm2:fr_beartrap': {
    hurt: ['MY LEG! MY LEG!', 'BEAR TRAP! I\'M NOT A BEAR!', 'IT ATE MY SOCK!', 'GET IT OFF! GET IT OFF!'],
    death: ['BEAR TRAP. NOT A BEAR.', 'THE BEAR TRAP WORKED'],
  },
  // (the bear trap's hurt has its own animation (hurtGags.ts: the jaws on his boot, hopping, howling), and its lines by
  // the state of him)
  'm2:fr_beartrap_shitty': {
    hurt: ['MY LEG! AND THERE GOES THE REST OF IT!', 'IT SQUEEZED THE SHIT RIGHT OUT OF ME!', 'BEAR TRAP! FILL THE OTHER LEG TOO!'],
    death: ['TRAPPED, SHAT, DONE', 'BEAR TRAP. SHITTY PANTS.'],
  },
  'm2:fr_beartrap_nude': {
    hurt: ['MY LEG! THANK GOD IT WENT FOR THE LEG!', "NAKED IN A BEAR TRAP! DON'T LOOK!", 'TWO INCHES FROM MY NUTS!'],
    death: ['NAKED IN A BEAR TRAP', 'BEAR TRAPPED, BARE ASS'],
  },
  'm2:fr_cone': {
    hurt: ['A PINE CONE! TO THE SKULL!', 'OW! THE TREE THREW IT!', 'BONK!'],
    death: ['KILLED BY A PINE CONE', 'THE TREE WON'],
  },
  'm2:fr_rolllog': {
    hurt: ['LOG! LOG!', 'IT ROLLED RIGHT OVER ME!', 'WHO STACKS LOGS ON A HILL?!'],
    death: ['FLATTENED BY A LOG', 'ROLLED OUT LIKE DOUGH'],
  },
  'm2:fr_bees': {
    hurt: ['BEES! BEES!', 'ONE STUNG MY TAINT!', 'NOT THE BEES!'],
    death: ['HE KNOCKED DOWN THE HIVE', 'THE BEES WON'],
  },
  'm2:fr_branch': {
    hurt: ['BRANCH! FACE!', 'I DIDN\'T DUCK!', 'TREE TO THE FACE!'],
    death: ['CLOTHESLINED BY A TREE', 'FORGOT TO DUCK'],
  },
  'm2:fr_falls': {
    hurt: ['OH NO. OH NO NO NO.'],
    death: ['FAKE FALLS. REAL ROCKS.', 'THE SIGN SAID FALLS AHEAD'],
  },
  'm2:fr_falls_log': {
    hurt: ['I SHOULD HAVE JUMPED!', 'THE LOG! THE LOG!'],
    death: ['WENT DOWN WITH THE LOG', 'RODE IT OVER THE FALLS'],
  },
  'm2:fr_doe': {
    hurt: ['THE DEER KICKED ME!', 'BAMBI\'S MOM HITS HARD!', 'RIGHT IN THE SHIN!'],
    death: ['KICKED TO DEATH BY A DEER', 'BAMBI\'S MOM GOT REVENGE'],
  },
  'm2:fr_buck': {
    hurt: ['THE BUCK RAMMED ME!', 'HE GOT ME IN THE BEANS!', 'HE HIT ME LIKE A TRUCK!'],
    death: ['RAMMED TO DEATH BY A BUCK', 'THE DEER HUNTED HIM'],
  },
  'm2:fr_antlers': {
    hurt: ['ANTLERS! I CHARGED INTO ANTLERS!', 'OW! POINTY END!', 'ANTLER IN MY ASS!'],
    death: ['SHOULDER CHARGED A BUCK', 'SKEWERED ON ANTLERS'],
  },
  'm2:fr_wolf': {
    hurt: ['THE WOLF BIT ME!', 'BAD DOG! BAD DOG!', 'HE\'S GOT MY ASS!'],
    death: ['EATEN BY WOLVES', 'THE WOLVES SHARED HIM'],
  },
  'm2:fr_cougar': {
    hurt: ['COUGAR! FROM ABOVE!', 'IT CLAWED MY FACE!', 'IT SAT ON MY FACE! IT SMELLS LIKE CAT ASS!'],
    death: ['MAULED BY A COUGAR', 'THE COUGAR PLAYED WITH HIM'],
  },
  'm2:fr_beaver': {
    hurt: ['THE BEAVER BIT ME!', 'IT WENT FOR MY WOOD!', 'IT SLAPPED ME WITH ITS TAIL!'],
    death: ['CHEWED UP BY A BEAVER', 'BUILT INTO A BEAVER DAM'],
  },
  'm2:fr_rattler': {
    hurt: ['SNAKE BITE!', 'IT RATTLED! I DIDN\'T LISTEN!', 'MY ANKLE\'S ON FIRE!'],
    death: ['BITTEN BY A RATTLESNAKE', 'IT RATTLED. HE IGNORED IT.'],
  },
  'm2:fr_crow': {
    hurt: ['STUPID CROW!', 'IT WENT FOR MY EYES!', 'GET OUT OF MY HAIR!'],
    death: ['PECKED TO DEATH BY CROWS', 'A LITERAL MURDER OF CROWS'],
  },
  'm2:fr_hawk': {
    hurt: ['HAWK! OUT OF NOWHERE!', 'TALONS! IN MY SCALP!', 'IT DIVE BOMBED ME!', 'I DIDN\'T LOOK UP!'],
    death: ['NEVER LOOKED UP', 'HAWK FOOD'],
  },
  'm2:fr_goose': {
    hurt: ['GOOSE! GOOSE!', 'IT HIT ME IN THE BACK OF THE HEAD!', 'HONK THIS, YOU PRICK!', 'THE GOOSE GOT ME!'],
    death: ['KILLED BY A GOOSE. A GOOSE.', 'GOOSED TO DEATH'],
  },
  'm2:fr_porcupine': {
    hurt: ['PORCUPINE!', 'QUILLS IN MY HAND! MY JERKING HAND!', 'OW! THE BACK END!'],
    death: ['KILLED BY A PORCUPINE', 'A PORCUPINE. OF ALL THINGS.'],
  },
  'm2:fr_quills': {
    hurt: ['QUILLS! IN MY FEET!', 'I DIVE KICKED A PORCUPINE!', 'PINCUSHION! I\'M A PINCUSHION!'],
    death: ['DIVE KICKED A PORCUPINE', 'A PINCUSHION WITH A HEAD'],
  },
  'm2:fr_bison': {
    hurt: ['BUFFALO! BUFFALO!', 'IT HIT ME LIKE A TRAIN!', 'TWO THOUSAND POUNDS OF NOPE!'],
    death: ['TRAMPLED BY A BISON', 'RUN OVER BY A BUFFALO'],
  },
  'm2:fr_horns': {
    hurt: ['I CHARGED A BUFFALO! WHY?!', 'HORNS! RIGHT IN THE GUT!', 'IT DIDN\'T EVEN MOVE!'],
    death: ['CHARGED A BISON. BISON WON.', 'HORNED BY A BUFFALO'],
  },
  'm2:fr_doe_ram': {
    hurt: ['THE DEER RAMMED ME!', 'SHE TURNED AROUND!', 'CORNERED DEER! BAD IDEA!', 'BAMBI\'S MOM HEADBUTTS!'],
    death: ['CORNERED A DEER. BAD IDEA.', 'BAMBI\'S MOM CAME BACK'],
  },
  'm2:fr_needles': {
    hurt: ['IT SHOT QUILLS AT ME!', 'NEEDLES! IN MY FACE!', 'IT SPRAYS?! SINCE WHEN?!', 'MY ASS IS A PINCUSHION!'],
    death: ['SHOT FULL OF QUILLS', 'HE STOOD THERE. IT SPRAYED.'],
  },
  'm2:fr_trout': {
    hurt: ['THE TROUT BIT ME!', 'A FISH JUMPED IN MY FACE!', 'TROUT DON\'T HAVE TEETH!', 'FISH SLAP!'],
    death: ['SLAPPED TO DEATH BY A TROUT', 'KILLED BY A FLYING FISH'],
  },
  'm2:fr_leech': {
    hurt: ['LEECHES! ON MY EVERYTHING!', 'GET OFF ME, YOU SLIMY DICKS!', 'THEY\'RE SUCKING ME DRY!', 'ONE\'S IN MY ASS CRACK!'],
    death: ['SUCKED DRY BY LEECHES', 'DIED A LEECH BUFFET'],
  },
};

// ---------------------------------------------------------------------------------------------------------------
// Each animal's own kill callouts (the announcer's), where the engine's would name some other creature: a kill made
// swimming (a lunge through the water) is otherwise FISH STICKS! / SUSHI!, whatever it was. By kind, then by callout.

const SWIM = (lines: string[]) => ({ swim: lines });
export const KILL_CALLS: Record<string, Record<string, string[]>> = {
  'm2:fr_doe': SWIM(['VENISON!', 'OH DEER!', 'DEER CROSSING!']),
  'm2:fr_buck': SWIM(['VENISON!', 'TROPHY BUCK!', 'MOUNTED!']),
  'm2:fr_wolf': SWIM(['BAD DOG!', 'NO MORE HOWLING!', 'PUPPY CHOW!']),
  'm2:fr_cougar': SWIM(['KITTY LITTER!', 'CAT NAP!', 'NINE LIVES USED!']),
  'm2:fr_beaver': SWIM(['DAM BUSTED!', 'LODGE CONDEMNED!', 'TAIL SLAPPED!', 'BEAVER DOWN!']),
  'm2:fr_rattler': SWIM(['SNAKE EYES!', 'RATTLED!', 'NO MORE RATTLE!']),
  'm2:fr_crow': SWIM(['EAT CROW!', 'BIRDIE!', 'GROUNDED!']),
  'm2:fr_hawk': SWIM(['HAWK DOWN!', 'TALONS UP!', 'BIRD OF PREY NO MORE!']),
  'm2:fr_goose': SWIM(['COOKED GOOSE!', 'HONK NO MORE!', 'GOOSE EGG!']),
  'm2:fr_porcupine': SWIM(['PINCUSHION!', 'POINTLESS!', 'DEFLATED!']),
  'm2:fr_bison': SWIM(['BUFFALO WINGS!', 'STAMPEDE OVER!', 'BISON BURGER!']),
  'm2:fr_hive': SWIM(['BEE GONE!', 'HIVE FIVE!']),
  'm2:fr_trout': SWIM(['FISH STICKS!', 'CATCH OF THE DAY!', 'FILLETED!', 'CATCH AND RELEASE!']),
};

export const VOICE_LINES: Record<string, string[]> = {
  meathead: [
    ...allOf(ARRIVE), ...Object.values(GAGS).flatMap(allOf), ...allOf(NO_TICKET), ...allOf(CHASE), ...STATION_EMPTY,
    ...Object.values(HURT).flatMap(h => h.hurt),
  ],
  death: Object.values(HURT).flatMap(h => h.death),
  announcer: [...new Set(Object.values(KILL_CALLS).flatMap(k => Object.values(k).flat()))],
  [TUCKER_VOICE]: [TUCKER_GREET, TUCKER_PITCH, TUCKER_TICKET, TUCKER_BLOCK, TUCKER_OOF, TUCKER_RAGE, TUCKER_RUN, TUCKER_CAB].flatMap(allOf),
};
