// What's said in Sawdust Gulch and the mines, by voice (frontier/voices.ts gathers it; tools/voices records it). In the
// user's voice: blunt, short, vulgar, specific; talk less; fit the trigger. Picked with pickLine. Meathead's lines and
// everybody reacting to him in clean / shitty / naked pools. The townsfolk are the park's staff in costume: they
// break character to yell at him. Pure data (tools/voices bundles it in node).

import { allOf, type ByPants, type HurtTable } from '../talk';

/** The townsfolk's voices (cast.json): a man's and a woman's for each sort. */
export const TOWN_VOICES = {
  man: 'm2.frontier.townsman', woman: 'm2.frontier.townswoman',
  sheriff: 'm2.frontier.sheriff', sherifff: 'm2.frontier.sherifff',
  salesman: 'm2.frontier.salesman', salesmanf: 'm2.frontier.salesmanf',
  undertaker: 'm2.frontier.undertaker', undertakerf: 'm2.frontier.undertakerf',
  prospector: 'm2.frontier.prospector', prospectorf: 'm2.frontier.prospectorf',
  quartet: 'm2.frontier.quartet',
  announcer: 'm2.frontier.announcer',
} as const;

// ---------------------------------------------------------------------------------------------------------------
// Meathead

/** In from the crash (the engine in the buffer stop, steaming). */
export const ARRIVE: ByPants = {
  clean: ['END OF THE LINE, TUCKER.', 'PUNCHED MY TICKET. AND HIS.'],
  shitty: ['I SHAT MYSELF ON IMPACT. FAIR ENOUGH.', 'END OF THE LINE. MY PANTS GOT THERE FIRST.'],
  nude: ['BUCK NAKED IN A TRAIN WRECK. NEW LOW.', 'END OF THE LINE. NO SEATBELT. NO PANTS.'],
};
/** The covered stretcher going by to FIRST AID. */
export const STRETCHER: ByPants = {
  clean: ['THAT IS ONE WAY TO GET OFF A TRAIN.', "DON'T BOTHER WITH FIRST AID. TRY A MOP."],
  shitty: ["HE GOT OFF EASY. I'M STILL IN THESE PANTS.", 'TAKE HIM. AND IF YOU GOT SPARE PANTS...'],
  nude: ["HE GETS A SHEET? I DON'T GET A SHEET?", 'HEY. TOSS ME THAT SHEET WHEN YOU ARE DONE.'],
};
/** Back on a later visit: the stop fixed. */
export const REVISIT: ByPants = {
  clean: ['THEY FIXED THE STOP. AND SENT ME THE BILL.', 'SAWDUST GULCH. STILL FAKE.'],
  shitty: ['BACK IN SAWDUST GULCH. STILL SHITTY. ME AND THE TOWN.', 'THEY FIXED THE STOP. NOT MY PANTS.'],
  nude: ['BACK IN SAWDUST GULCH. STILL NO PANTS.', 'THEY FIXED THE STOP. NOBODY FIXED ME.'],
};
/** Main street. */
export const TOWN_IN: ByPants = {
  clean: ['A FAKE TOWN FULL OF FAKE COWBOYS. GREAT.', 'SAWDUST GULCH. SMELLS LIKE FUDGE AND LAWSUITS.'],
  shitty: ["SAWDUST GULCH. I'M ADDING TO THE SMELL.", 'FAKE TOWN. REAL SHIT IN MY PANTS.'],
  nude: ['NAKED IN THE OLD WEST. THEY HANGED GUYS FOR LESS.', 'FAKE TOWN. REAL BALLS.'],
};
/** The empty coffin in the undertaker's window, Tucker's name on it. */
export const COFFIN: ByPants = {
  clean: ['COFFIN WITH HIS NAME ON IT. EMPTY. THEY ARE STILL HOSING HIM OFF THE ENGINE.', 'RESERVED FOR TUCKER. NOBODY HOME.'],
  shitty: ['EMPTY COFFIN. I COULD HIDE THESE PANTS IN THERE.', 'NOBODY IN IT. SMELLS LIKE SOMEBODY IN IT NOW.'],
  nude: ['EMPTY COFFIN. DOES IT COME WITH A SUIT? NO? FINE.', 'NOBODY IN IT. ROOMY. COLD ON THE BALLS.'],
};
export const SALOON_IN: ByPants = {
  clean: ["A SALOON. FINALLY SOMETHING I'M GOOD AT.", 'SARSAPARILLA? NO. THE OTHER THING.'],
  shitty: ['BARKEEP. WHISKEY. AND A TOWEL.', "SALOON. I'LL TAKE A STOOL. NOT LIKE THAT."],
  nude: ['SALOON. NO SHIRT, NO SHOES, NO PROBLEM.', "BARKEEP. WHISKEY. DON'T LOOK DOWN."],
};
export const BRAWL_DONE: ByPants = {
  clean: ['LAST CALL.', "BAR'S CLOSED. FOREVER."],
  shitty: ["LAST CALL. I'M TAKING THE BAR TOWEL.", "BRAWL'S OVER. THE STOOLS ARE RUINED."],
  nude: ['LAST CALL. NOBODY LOOK.', "BAR'S CLOSED. I'M STILL OPEN."],
};
export const SHOWDOWN_IN: ByPants = {
  clean: ['A SHOWDOWN. I BROUGHT A GUN TO A GUN SHOW.', "THIS TOWN AIN'T BIG ENOUGH. IT'S PLYWOOD."],
  shitty: ["DRAW, PARTNER. I ALREADY DREW. IN MY PANTS.", "A SHOWDOWN. I'M ALREADY LOADED."],
  nude: ['A SHOWDOWN. I GOT NOTHING TO HIDE A GUN IN.', 'DRAW. YEAH. THAT IS A GUN TOO.'],
};
export const SHOWDOWN_DONE: ByPants = {
  clean: ["SHOW'S OVER. TIP YOUR SHERIFF.", "NEXT SHOW'S CANCELED. FOREVER."],
  shitty: ["SHOW'S OVER. NOBODY ASK ABOUT THE SMELL.", 'STANDING OVATION. FROM A DISTANCE.'],
  nude: ["SHOW'S OVER. YOU ALL SAW EVERYTHING.", 'STANDING OVATION. FOR WHICH PART?'],
};
export const POND: ByPants = {
  clean: ['LOGS AGAIN. FINE.', 'MILL POND. SAME LOGS, MORE ASSHOLES.'],
  shitty: ['IF I FALL IN, AT LEAST I RINSE OFF.', 'LOGS AGAIN. MY PANTS WANT ME TO FALL IN.'],
  nude: ['LOGS AGAIN. EVERYTHING SWINGS ON A LOG.', 'IF I SLIP: SPLINTERS. EVERYWHERE.'],
};
/** A lumberjack on his own log, coming at him. */
export const BIRLER_SEEN: ByPants = {
  clean: ['A GUY ON A LOG WANTS A LOG FIGHT. OKAY.', 'LOG ROLLING CHAMP. NOT FOR LONG.'],
  shitty: ['LOG FIGHT. I GOT A HEAD START ON THE STINK.', "COME ON, LOG BOY. I'M ALREADY DIRTY."],
  nude: ['A LOG FIGHT. NAKED. THIS IS HOW LEGENDS START.', 'COME ON, LOG BOY. NOTHING LEFT TO LOSE.'],
};
/** Up the jack ladder on a log. */
export const LADDER_UP: ByPants = {
  clean: ['GOING UP.', 'FREE RIDE.'],
  shitty: ['GOING UP. SO IS THE SMELL.', 'FREE RIDE. STICKY RIDE.'],
  nude: ['GOING UP. EVERYTHING IN THE BREEZE.', 'FREE RIDE. SPLINTERS INCLUDED.'],
};
export const MILL: ByPants = {
  clean: ['SAWMILL. KEEP THE DICK AWAY FROM THE BLADE.', "THAT SAW IS REAL. GREAT."],
  shitty: ['SAWMILL. I COULD SAW THROUGH THESE PANTS.', 'SPINNING BLADE. ALREADY CLENCHED.'],
  nude: ['NAKED IN A SAWMILL. EVERY PART OF ME HATES THIS.', 'THAT BLADE IS AT EXACTLY THE WRONG HEIGHT.'],
};
export const MINE: ByPants = {
  clean: ['A MINE. FAKE GOLD, REAL DARK.', 'MOTHER LODE MINE. DOWN WE GO.'],
  shitty: ['DOWN A DARK HOLE. FITTING.', 'A MINE. NOBODY CAN SMELL ME DOWN HERE.'],
  nude: ['A COLD DARK HOLE. AND I AM NAKED.', 'MINE SHAFT. SHRINKAGE INCOMING.'],
};
/** The first runaway cart. */
export const CARTS: ByPants = {
  clean: ['RUNAWAY CART! WHO IS RUNNING THIS MINE?', 'NOBODY STEERS THESE THINGS. GOOD.'],
  shitty: ['RUNAWAY CART. I CAN RELATE.', 'THAT CART IS CARRYING MORE THAN ORE. SO AM I.'],
  nude: ['RUNAWAY CART. AND I GOT NOTHING TO CUSHION IT.', 'CART. COMING. BALLS. EXPOSED.'],
};
export const RIDE_CART: ByPants = {
  clean: ['HOP IN THE CART. WHAT COULD GO WRONG.', 'MINE CART. ALL ABOARD.'],
  shitty: ['MINE CART. THE ORE WILL NEVER RECOVER.', 'HOP IN. I BRING MY OWN FREIGHT.'],
  nude: ['BARE ASS ON COLD IRON. LOVELY.', 'MINE CART. MIND THE SPLINTERS.'],
};
/** The canary dead in its cage at the gas. */
export const CANARY: ByPants = {
  clean: ["DEAD CANARY. DON'T SHOOT IN HERE.", 'THE BIRD IS DEAD. HOLD YOUR FIRE.'],
  shitty: ['DEAD CANARY. COULD HAVE BEEN MY FAULT.', 'THE BIRD DIED. I MIGHT HAVE DONE THAT.'],
  nude: ['DEAD CANARY. NO GUNS. NO SPARKS. NOTHING.', 'THE BIRD IS DEAD. HOLD FIRE. HOLD EVERYTHING.'],
};
export const FLOOD: ByPants = {
  clean: ['FLOODED. UNDER THE ROCK. SWIM.', 'HOLD YOUR BREATH, MEATHEAD.'],
  shitty: ['FLOODED. FREE BATH.', 'UNDERWATER. FINALLY CLEAN.'],
  nude: ['FLOODED. COLD. VERY COLD.', 'SWIM UNDER. IN THE DARK. NAKED. SURE.'],
};
/** The log ride's queue. */
export const QUEUE: ByPants = {
  clean: ['LOG RIDE. NINETY MINUTE WAIT. WATCH ME.', 'TIMBER TUMBLE. I AM CUTTING.'],
  shitty: ['NINETY MINUTES IN LINE? IN THESE PANTS? NO.', "THEY'LL LET ME CUT. THEY'LL WANT ME TO CUT."],
  nude: ['NINETY MINUTE LINE. THEY WILL PART FOR ME.', 'NAKED GUY CUTTING THE LINE. TRY AND STOP ME.'],
};

// ---------------------------------------------------------------------------------------------------------------
// The townsfolk (barks: rare, one at a time, over their heads while said)

export const DEPUTY_BARK: ByPants = {
  clean: ['REACH FOR THE SKY! SERIOUSLY, DUDE, YOU WRECKED A TRAIN.', 'THIS IS A FAMILY TOWN, MISTER!', 'I GET NINE BUCKS AN HOUR FOR THIS!'],
  shitty: ['YOU SHIT YOURSELF IN MY TOWN?', "DRAW! UGH. HE'S LEAKING."],
  nude: ['SIR, THIS IS A FAMILY TOWN! HOLSTER THAT!', "NAKED STRANGER! I'M NOT FRISKING HIM!"],
};
export const SHERIFF_DRAW: ByPants = {
  clean: ['DRAW!', 'SLAP LEATHER!', 'FILL YOUR HAND!'],
  shitty: ['DRAW! AND QUIT DRIPPING!', 'SLAP LEATHER, STINKY!'],
  nude: ['DRAW! FROM WHERE?', 'FILL YOUR HAND! NOT LIKE THAT!'],
};
export const SHERIFF_BARK: ByPants = {
  clean: ["THIS TOWN AIN'T BIG ENOUGH FOR THE TWO OF US. IT'S IN MY CONTRACT.", 'FOUR HUNDRED SHOWS. NOBODY EVER SHOT BACK.'],
  shitty: ["THIS TOWN AIN'T BIG ENOUGH FOR THE TWO OF US. AND YOUR SMELL.", 'YOU MESSED YOUR CHAPS, STRANGER.'],
  nude: ["STRANGER, WHERE'S YOUR HOLSTER? WHERE'S ANYTHING?", 'THIS TOWN HAS A DRESS CODE, MISTER.'],
};
export const SALESMAN_BARK: ByPants = {
  clean: ["DOCTOR PEABODY'S MIRACLE TONIC! CURES WHAT AILS YA! IT'S APPLE JUICE!", 'ONE BOTTLE TO THE FACE! FREE OF CHARGE!'],
  shitty: ['TONIC FOR THE TROTS! YOU NEED A CASE!', 'MY TONIC CURES THAT! IT CAUSED IT, TOO!'],
  nude: ['TONIC FOR SHRINKAGE! SIR, YOU NEED A CASE!', 'HAIR TONIC! SIR! NOT THERE!'],
};
/** The quartet's tell: the first half (sung as they wind up), then the second (the slash). */
export const QUARTET_SING: ByPants = {
  clean: ['SHAVE AND A HAIRCUT...'],
  shitty: ['SHAVE AND A HOSE-DOWN...'],
  nude: ['SHAVE AND A BIKINI WAX...'],
};
export const QUARTET_HIT: ByPants = { clean: ['TWO BITS!'], shitty: ['TWO BITS!'], nude: ['TWO BITS!'] };
export const QUARTET_BARK: ByPants = {
  clean: ['WE GO ON AFTER THE TRAIN WRECK!', 'BARBERSHOP HARMONY! AND BLADES!'],
  shitty: ["WE DON'T DO WAXING! OR WHATEVER THAT IS!", 'A SHAVE, A HAIRCUT, AND A HOSE-DOWN!'],
  nude: ["A FULL BODY SHAVE? SIR, WE'RE A QUARTET!", 'A LITTLE OFF THE TOP! AND THE BOTTOM!'],
};
export const BOUNCER_BARK: ByPants = {
  clean: ["YOU'RE CUT OFF.", 'NO TRAIN WRECKERS IN MY SALOON.'],
  shitty: ['NOT IN MY SALOON, STINKY.', 'SMELL LIKE THAT, YOU DRINK OUTSIDE.'],
  nude: ['NO SHIRT, NO SHOES, NO PANTS, NO SERVICE.', 'SIR. COVER EVERYTHING.'],
};
export const DANCER_BARK: ByPants = {
  clean: ['KICK LINE! AND KICK! AND KICK HIM!', 'I HAVE A THEATER DEGREE!'],
  shitty: ["I'M NOT KICKING THAT. FINE. I'M KICKING THAT.", 'UGH! THESE ARE RENTAL BLOOMERS!'],
  nude: ['MY BLOOMERS STAY ON. UNLIKE YOURS.', 'OH, HONEY. NO.'],
};
export const UNDERTAKER_MEASURE: ByPants = {
  clean: ['HOLD STILL. SIX FOOT ONE. STANDARD BOX.', "MEASURING YOU FOR A PINE BOX. DON'T MIND ME."],
  shitty: ['SIX FOOT ONE. AND A LINER. A THICK LINER.', "YOU'LL NEED THE SEALED CASKET."],
  nude: ['NO SUIT TO BURY YOU IN. SAVES ME TIME.', 'SIX FOOT ONE. PLUS THAT. HOLD STILL.'],
};
export const SMITH_BARK: ByPants = {
  clean: ['HOT SHOES! FRESH OFF THE ANVIL!', "I SHOE HORSES. YOU'RE CLOSE ENOUGH."],
  shitty: ["I'LL FORGE YOU A DIAPER. IN IRON.", 'YOU SMELL WORSE THAN THE LIVERY.'],
  nude: ['PUT SOMETHING ON! AN APRON! ANYTHING!', "I'M NOT SWINGING A HAMMER NEAR THAT."],
};
export const FARMHAND_BARK: ByPants = {
  clean: ["GIT OFF MY LAND! IT'S THE PARK'S LAND! GIT ANYWAY!", "PITCHFORK'S REAL, PARTNER."],
  shitty: ['YOU SMELL LIKE THE STABLE. WORSE.', 'SOMEBODY SHOVEL HIM OUT.'],
  nude: ['WE GELD ANIMALS HERE, MISTER.', 'PUT THAT BACK IN THE BARN.'],
};
export const FELLER_TIMBER: ByPants = {
  clean: ['TIMBER!'],
  shitty: ['TIMBER! ON THE STINKY GUY!'],
  nude: ['TIMBER! ON THE NAKED GUY!'],
};
export const FELLER_BARK: ByPants = {
  clean: ['LUMBERJACK DEMO! KEEP BACK!', "THAT TREE'S PLYWOOD. STILL HURTS."],
  shitty: ['SOMEBODY CHOPPED A LOG IN HIS PANTS.', 'STAND DOWNWIND, BUDDY.'],
  nude: ['NICE WOOD. SMALL WOOD.', 'PUT SOME FLANNEL ON!'],
};
export const BIRLER_BARK: ByPants = {
  clean: ['BIRLING CHAMP THREE YEARS RUNNING!', 'YOU CALL THAT FOOTWORK?'],
  shitty: ['GET OFF MY POND, STINKY!', "YOU'RE SPOILING THE WATER!"],
  nude: ['NAKED ON A LOG? BRAVE. STUPID.', 'WATCH THE BARK, BUDDY. IT GRABS.'],
};
export const MINER_BARK: ByPants = {
  clean: ['BACK OF THE TOUR GROUP, PAL!', "THE GOLD'S PAINTED ON. THE PICK ISN'T."],
  shitty: ["SMELLS LIKE A GAS LEAK. NOPE. IT'S HIM.", 'STAY DOWNWIND, PAL.'],
  nude: ['HARD HATS REQUIRED! AND PANTS!', 'COLD DOWN HERE, HUH? I CAN TELL.'],
};
export const PROSPECTOR_BARK: ByPants = {
  clean: ["THAR'S GOLD IN THEM HILLS! AND DYNAMITE IN THIS HAND!", 'CLAIM JUMPER! GIT!'],
  shitty: ["SOMETHING DIED IN THIS MINE! OH. IT'S YOU.", "DYNAMITE'LL CLEAR THAT SMELL!"],
  nude: ['YOU PANNING FOR GOLD DOWN THERE, SON?', "AIN'T NOTHING IN THAT CREEK WORTH SEEING!"],
};

// ---------------------------------------------------------------------------------------------------------------
// The showdown's announcer, over the speakers on the bleachers

export const SHOW_OPEN: ByPants = {
  clean: ["FOLKS, TAKE YOUR SEATS! IT'S THE SAWDUST GULCH SHOWDOWN!", "HERE COMES THE SHERIFF! AND SOME GUY WHO WASN'T AT REHEARSAL!"],
  shitty: ["FOLKS, IT'S THE SHOWDOWN! THAT SMELL IS NOT PART OF THE SHOW!", 'SOMEBODY SOILED THE STAGE! THE SHOW GOES ON!'],
  nude: ["FOLKS, COVER THE KIDS' EYES! IT'S THE SHOWDOWN!", 'THE STRANGER WEARS NO HAT. OR ANYTHING.'],
};
export const SHOW_CLOSE: ByPants = {
  clean: ["THAT'S, UH. THAT'S THE SHOW, FOLKS.", 'PLEASE EXIT TO YOUR LEFT. THE SHERIFF WILL NOT BE SIGNING AUTOGRAPHS.'],
  shitty: ["THAT'S THE SHOW. WE'LL HOSE DOWN THE STREET.", 'PLEASE EXIT QUICKLY. BREATHE THROUGH YOUR MOUTH.'],
  nude: ["THAT'S THE SHOW. REFUNDS AT GUEST SERVICES.", 'PLEASE EXIT. AND TRY TO UNSEE THAT.'],
};

// ---------------------------------------------------------------------------------------------------------------
// What hurts him here (and the death screen when it's what killed him)

export const HURT: HurtTable = {
  'm2:fr_deputy': { hurt: ['PISTOL WHIPPED BY A DEPUTY!', 'THE TIN STAR HIT ME!', 'MY TEETH! MY COWBOY TEETH!'], death: ['BEATEN DOWN BY A DEPUTY', 'DEPUTIZED. INTO THE GROUND.'] },
  'm2:fr_deputy_shot': { hurt: ["I'M SHOT! BY A DEPUTY!", "THAT'S NOT A CAP GUN!", 'SHOT BY THE LAW! THE FAKE LAW!'], death: ['SHOT BY A NINE-DOLLAR DEPUTY', 'GUNNED DOWN ON MAIN STREET'] },
  'm2:fr_sheriff': { hurt: ['THE SHERIFF SLUGGED ME!', 'BUTT OF THE GUN! RIGHT IN THE FACE!', 'OW! THE BADGE IS SHARP!'], death: ['BEATEN BY THE SHERIFF', 'THE SHERIFF CLEANED UP THE TOWN'] },
  'm2:fr_sheriff_shot': { hurt: ['THE SHERIFF SHOT ME!', 'HE FANNED THE HAMMER!', 'LEAD! IN ME!'], death: ['OUTDRAWN BY THE SHERIFF', 'LOST THE SHOWDOWN. TO A GUY WITH A CONTRACT.'] },
  'm2:fr_snakeoil': { hurt: ['HE SMASHED A BOTTLE ON ME!', 'TONIC! IN MY EYES!', 'IT IS APPLE JUICE! IT STINGS!'], death: ['BOTTLED BY A SNAKE OIL SALESMAN', 'CURED. PERMANENTLY.'] },
  'm2:fr_tonic': { hurt: ['THE FUMES! THE FUMES!', 'MIRACLE TONIC! IT BURNS!', "WHAT'S IN THIS? NOT APPLE JUICE!"], death: ['GASSED BY MIRACLE TONIC', 'DIED OF WHAT AILED HIM'] },
  'm2:fr_barber': { hurt: ['HE CUT ME! WITH A RAZOR!', 'TWO BITS! TWO SLASHES!', 'A CLOSE SHAVE! TOO CLOSE!'], death: ['SHAVED TO DEATH BY A QUARTET', 'SHAVE AND A HAIRCUT. DEAD.'] },
  'm2:fr_bouncer': { hurt: ['THE BOUNCER THREW ME!', 'HE TOSSED ME LIKE A DRUNK!', 'I WAS LEAVING ANYWAY!'], death: ['THROWN OUT OF A SALOON. TO HEAVEN.', 'CUT OFF BY THE BOUNCER'] },
  'm2:fr_dancer': { hurt: ['CAN-CAN KICK! IN THE NUTS!', 'SHE KICKED ME IN THE FACE!', 'THOSE BOOTS ARE POINTY!'], death: ['KICKED TO DEATH BY A KICK LINE', 'CAN-CANNED'] },
  'm2:fr_bottle': { hurt: ['WHISKEY BOTTLE! TO THE HEAD!', 'GLASS! EVERYWHERE!', 'WHAT A WASTE OF WHISKEY!'], death: ['BOTTLED IN A SALOON', 'KILLED BY A FLYING WHISKEY BOTTLE'] },
  'm2:fr_undertaker': { hurt: ['THE UNDERTAKER! WITH A SHOVEL!', 'HE MEASURED ME! THEN HE HIT ME!', 'NOT YET! NOT YET!'], death: ['BURIED BY THE UNDERTAKER', 'MEASURED, THEN MURDERED'] },
  'm2:fr_blacksmith': { hurt: ['HAMMERED BY A BLACKSMITH!', 'LIKE A HORSESHOE ON AN ANVIL!', 'MY SKULL! IT RANG!'], death: ['FORGED FLAT BY A BLACKSMITH', 'HAMMERED INTO A HORSESHOE'] },
  'm2:fr_horseshoe': { hurt: ['HOT HORSESHOE! HOT!', "IT'S RED HOT! IT'S RED HOT!", 'LUCKY HORSESHOE! NOT LUCKY!'], death: ['BRANDED BY A HORSESHOE', 'HIS LUCK RAN OUT. RED HOT.'] },
  'm2:fr_farmhand': { hurt: ['THE FARMHAND HIT ME!', 'WITH THE HANDLE! THE FORK HANDLE!', 'GET OFF ME, HAYSEED!'], death: ['BEATEN BY A FARMHAND', 'PITCHED INTO THE HAY'] },
  'm2:fr_pitchfork': { hurt: ['I CHARGED A PITCHFORK!', 'FOUR HOLES! FOUR NEW HOLES!', 'FORKED! LIKE A HAY BALE!'], death: ['SHOULDER CHARGED A PITCHFORK', 'FORKED LIKE A HAY BALE'] },
  'm2:fr_feller': { hurt: ['AN AXE! TO THE BODY!', "THE LUMBERJACK CHOPPED ME!", 'I AM NOT A TREE!'], death: ['CHOPPED DOWN BY A LUMBERJACK', 'FELLED'] },
  'm2:fr_hatchet': { hurt: ['HATCHET! IN MY SHOULDER!', 'FLYING AXE! FLYING AXE!', 'HE THREW AN AXE AT ME!'], death: ['HATCHETED', 'SPLIT LIKE KINDLING'] },
  'm2:fr_timber': { hurt: ['TIMBER! ON ME!', 'A TREE! A WHOLE TREE!', 'PLYWOOD HURTS!'], death: ['FLATTENED BY A FALLING TREE', 'HE DID NOT STAND CLEAR'] },
  'm2:fr_birler': { hurt: ['HE RAMMED MY LOG!', 'LOG BULLY!', 'STAY ON YOUR OWN LOG!'], death: ['OUT-BIRLED', 'LOST A LOG FIGHT'] },
  'm2:fr_miner': { hurt: ['PICKAXE! IN MY BACK!', 'THE MINER HIT ME!', 'I AM NOT ORE!'], death: ['PICKAXED BY A MINER', 'MINED'] },
  'm2:fr_hotwax': { hurt: ['HOT WAX! ON MY ASS!', 'I DIVE KICKED A CANDLE!', 'HIS HAT IS ON FIRE! SO AM I!'], death: ['DIVE KICKED A LIT CANDLE', 'WAXED'] },
  'm2:fr_prospector': { hurt: ['THE OLD MAN HIT ME!', 'WITH A GOLD PAN!', 'GET OFF MY CLAIM, GRANDPA!'], death: ['PANNED BY A PROSPECTOR', 'BEATEN BY AN OLD-TIMER'] },
  'm2:fr_dynamite': { hurt: ['DYNAMITE! DYNAMITE!', 'MY EARS! MY EVERYTHING!', 'KABOOM! OW!'], death: ['BLOWN UP BY DYNAMITE', 'IN PIECES ALL OVER THE MINE'] },
  'm2:fr_cavein': { hurt: ['CAVE-IN! CAVE-IN!', 'ROCKS! ON MY HEAD!', 'THE CEILING! THE WHOLE CEILING!'], death: ['BURIED IN A CAVE-IN', 'THE MINE CAME DOWN ON HIM'] },
  'm2:fr_ore': { hurt: ['ORE! A TON OF ORE!', 'ROCKS FROM THE CEILING!', 'FAKE GOLD! REAL ROCKS!'], death: ['BURIED UNDER A CHUTE OF ORE', 'DUMPED ON'] },
  'm2:fr_minecart': { hurt: ['RUNAWAY CART! OW!', 'HIT BY A MINE CART!', 'IRON WHEELS! ON ME!'], death: ['RUN OVER BY A MINE CART', 'FLATTENED ON THE TRACKS'] },
  'm2:fr_beam': { hurt: ['LOW BEAM! MY HEAD!', 'DUCK! I SHOULD HAVE DUCKED!', 'BEAM! TO THE FACE!'], death: ['HEADBUTTED A BEAM', 'SHOULD HAVE DUCKED'] },
  'm2:fr_firedamp': { hurt: ['THE GAS! IT BLEW!', 'FIREBALL! FIREBALL!', 'MY EYEBROWS! GONE!'], death: ['SHOT THE GAS. THE GAS SHOT BACK.', 'BLOWN UP IN A GAS POCKET'] },
  'm2:fr_millsaw': { hurt: ['THE SAW! THE SAW!', 'IT BIT ME! THE BLADE BIT ME!', 'NOT THE BLADE!'], death: ['SAWED IN HALF AT THE MILL', 'CUT INTO LUMBER'] },
};

const pools = (r: ByPants) => allOf(r);
/** Everything the townsfolk's own voices say (men and women both do every job). */
const TOWNSFOLK = [DEPUTY_BARK, BOUNCER_BARK, DANCER_BARK, SMITH_BARK, FARMHAND_BARK, FELLER_TIMBER, FELLER_BARK, BIRLER_BARK, MINER_BARK];
export const VOICE_LINES: Record<string, string[]> = {
  meathead: [
    ...[ARRIVE, STRETCHER, REVISIT, TOWN_IN, COFFIN, SALOON_IN, BRAWL_DONE, SHOWDOWN_IN, SHOWDOWN_DONE, POND, BIRLER_SEEN, LADDER_UP, MILL, MINE, CARTS, RIDE_CART, CANARY, FLOOD, QUEUE].flatMap(allOf),
    ...Object.values(HURT).flatMap(h => h.hurt),
  ],
  death: Object.values(HURT).flatMap(h => h.death),
  [TOWN_VOICES.man]: TOWNSFOLK.flatMap(pools),
  [TOWN_VOICES.woman]: TOWNSFOLK.flatMap(pools),
  [TOWN_VOICES.sheriff]: [SHERIFF_DRAW, SHERIFF_BARK].flatMap(pools),
  [TOWN_VOICES.sherifff]: [SHERIFF_DRAW, SHERIFF_BARK].flatMap(pools),
  [TOWN_VOICES.salesman]: pools(SALESMAN_BARK), [TOWN_VOICES.salesmanf]: pools(SALESMAN_BARK),
  [TOWN_VOICES.undertaker]: pools(UNDERTAKER_MEASURE), [TOWN_VOICES.undertakerf]: pools(UNDERTAKER_MEASURE),
  [TOWN_VOICES.prospector]: pools(PROSPECTOR_BARK), [TOWN_VOICES.prospectorf]: pools(PROSPECTOR_BARK),
  [TOWN_VOICES.quartet]: [QUARTET_SING, QUARTET_HIT, QUARTET_BARK].flatMap(pools),
  [TOWN_VOICES.announcer]: [SHOW_OPEN, SHOW_CLOSE].flatMap(pools),
};
