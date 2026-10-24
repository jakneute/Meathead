// What's said in the broomstick deathmatch, by voice (fantasy/voices.ts gathers it; tools/voices records it). In the
// user's voice: blunt, short, vulgar, specific; talk less; fit the trigger. Picked with pickLine (never twice in 45 s).
// Meathead's lines, and every suitor's at him, in clean / shitty / naked pools (naked: the boner, on a broom). Piper's
// on the PA (her lust is for being fought over: purring over the blood, coy about the prize). The suitors trash-talk
// him and each other, and scream going down. Pure data.

import { allOf, PIPER_PA_VOICE, type ByPants, type HurtTable } from '../talk';

/** Who's in the sky: the ride's survivors (glen/rivals.ts), the FASTPASS boys (keep/runway.ts), and the LATE ENTRIES
 *  (new: paid cash at the gate for the last trial). Their voices (cast.json). */
export type FlyerId = 'blake' | 'rafael' | 'hank' | 'chet' | 'thaddeus' | 'dmitri' | 'brody' | 'sven' | 'sebastian';
export const BROOM_VOICES: Record<FlyerId, string> = {
  blake: 'm2.fantasy.suitor_blake', rafael: 'm2.fantasy.suitor_rafael', hank: 'm2.fantasy.suitor_hank',
  chet: 'm2.fantasy.suitor_chet', thaddeus: 'm2.fantasy.suitor_thaddeus', dmitri: 'm2.fantasy.suitor_dmitri',
  brody: 'm2.fantasy.suitor_brody', sven: 'm2.fantasy.suitor_sven', sebastian: 'm2.fantasy.suitor_sebastian',
};

// ---------------------------------------------------------------------------------------------------------------
// Meathead

/** Up in the air, the fight on (the first time this visit). */
export const MH_START: ByPants = {
  clean: ['LAST MAN FLYING GETS LAID. LET\'S FLY.', "I NEVER FLEW A BROOM. I NEVER FLEW ANYTHING. LET'S GO."],
  shitty: ['FLYING WITH A LOAD IN MY PANTS. LOOK OUT BELOW.', "IF SOMETHING FALLS ON YOUR HEAD, IT'S NOT RAIN."],
  nude: ['NAKED ON A BROOM. THE BRISTLES ARE IN MY ASS CRACK.', 'THE BONER IS POINTING AT HER WINDOW. FOLLOW IT.'],
};
/** Back up after dying. */
export const MH_AGAIN: ByPants = {
  clean: ['BACK ON THE BROOM.', 'ROUND TWO. SAME BROOM. SAME HEMORRHOIDS.'],
  shitty: ['BACK UP. STILL SHITTY.', "BACK ON. THE BROOM'S BROWN NOW. IT WAS BLONDE."],
  nude: ['BACK ON. SPLINTERS IN BAD PLACES.', "BACK UP. DEATH DIDN'T EVEN SOFTEN IT."],
};
/** He's killed one. */
export const MH_KILL: ByPants = {
  clean: ['ONE LESS DICK IN THE SKY.', 'GROUNDED. PERMANENTLY.', 'STAY IN YOUR LANE, ASSHOLE. YOUR LANE IS THE GROUND.', "SHE WATCHED THAT. SHE'S TOUCHING HERSELF. I KNOW IT."],
  shitty: ['HE DIED SMELLING ME. FAIR.', 'HE DIED IN THE SHIT FOG.'],
  nude: ['KILLED BY A NAKED GUY. TELL YOUR FRIENDS.', 'DOWN HE GOES. I STAY UP. BOTH KINDS OF UP.'],
};
/** They killed one of their own. */
export const MH_INFIGHT: ByPants = {
  clean: ["THANKS FOR THE ASSIST, DIPSHIT. YOU'RE NEXT.", 'KEEP KILLING EACH OTHER. LESS WORK.'],
  shitty: ["THEY'RE DOING MY JOB. I'LL JUST SIT HERE. IN IT."],
  nude: ['THEY KILL EACH OTHER. I JUST STAY HARD.'],
};
/** Turned back by the park's edge (the magic wall). */
export const MH_WALL: ByPants = {
  clean: ['A MAGIC WALL. SHE DOESN\'T WANT ME LEAVING.', 'A FORCE FIELD. THEY SPENT MONEY ON THAT AND NOT TOILET PAPER.'],
  shitty: ['THE FORCE FIELD SMELLS ME AND SAYS NO.'],
  nude: ["THE FORCE FIELD ZAPPED MY BALLS. THEY'RE HUMMING."],
};
/** The late entries fly in. */
export const MH_LATE: ByPants = {
  clean: ["MORE OF THEM? SHE'S SELLING TICKETS. TO WATCH US DIE.", 'LATE ENTRIES. LATE TO THEIR FUNERALS.'],
  shitty: ['NEW GUYS. THEY JUST FLEW INTO MY FART CLOUD.'],
  nude: ['MORE SUITORS. MORE WITNESSES TO THIS BONER.'],
};
/** One left. */
export const MH_LAST: ByPants = {
  clean: ['ONE LEFT. THEN THE WINDOW. THEN THE BED.', 'LAST ONE. PIPER, PUT ON SOMETHING NICE.'],
  shitty: ['ONE LEFT. THEN A WET WIPE. THEN PIPER.'],
  nude: ['ONE LEFT. THE BONER CAN TASTE IT.'],
};
/** All dead: the rose barrier's down, at the window he goes. */
export const MH_WIN: ByPants = {
  clean: ['LAST MAN FLYING. PIPER, I\'M COMING IN.', "THE WINDOW'S OPEN. MY DICK'S A HEAT-SEEKING MISSILE."],
  shitty: ['I WON. I\'M COMING IN HOT. AND BROWN.', "HER WINDOW. HOPE SHE'S GOT A BIDET."],
  nude: ['THE BONER KNOWS THE WAY. HOLD ON.', 'FULL MAST. FULL SPEED. HER WINDOW.'],
};

// ---------------------------------------------------------------------------------------------------------------
// Piper on the PA (the castle's horns)

export const PIPER_START = ['FLY, BOYS. AND BLEED ON MY LAWN.', 'THE WHOLE SKY IS YOURS. FILL IT WITH GUTS.'];
/** He's killed one. */
export const PIPER_KILL = ['OOH. HE WENT DOWN SPINNING.', 'MESSY. DO IT AGAIN.', 'THAT ONE SCREAMED SO PRETTY.', "MORE. I'M SO CLOSE."];
/** They killed one of their own. */
export const PIPER_INFIGHT = ['YES. EAT EACH OTHER, BOYS.', 'ONE OF YOU KILLED A FRIEND. I FELT THAT. DOWN THERE.'];
/** The late entries (paid cash at the gate). */
export const PIPER_LATE = ['LATE ENTRIES, BOYS. THEY PAID CASH.', 'FRESH MEAT. CASH ONLY. NO REFUNDS ON DEATH.'];
/** One left. */
export const PIPER_LAST = ['TWO LEFT IN MY SKY. ONLY ONE GETS IN.', "JUST YOU TWO. KILL HIM SLOW. I'M WATCHING."];
/** All dead: her window's open. */
export const PIPER_WIN = ['LAST MAN FLYING. MY WINDOW\'S OPEN, DARLING.', 'THE ROSES ARE DOWN. COME UP. WIPE YOUR FEET.'];
/** He's flown into the park's edge. */
export const PIPER_WALL = ['NO LEAVING, DARLING. NOT TILL THEY\'RE DEAD.'];

// ---------------------------------------------------------------------------------------------------------------
// The suitors

/** At him (his state), as they come at him. */
export const TAUNT: Record<FlyerId, ByPants> = {
  blake: { clean: ['EAT WHEY, BRO.', 'THIS SHAKE HAS CREATINE AND YOUR DEATH IN IT, BRO.'], shitty: ['YOU\'RE LEAKING ON THE GARDENS, BRO.'], nude: ['BRO. PUT IT AWAY. WE\'RE FLYING.'] },
  rafael: { clean: ['SHE\'S WATCHING. WATCH ME KILL YOU.', 'LOOK AT MY JAW. NOW LOOK AT YOUR JAW. EXACTLY.'], shitty: ['YOU\'RE A CROP DUSTER NOW.'], nude: ['I CAN SEE IT FROM HERE. BARELY. SAD.'] },
  hank: { clean: ['JOUST ME, COWARD!', 'HANK LANCE IS FOAM. HANK HATE IS REAL.'], shitty: ['LITTLE MAN SMELL LIKE TURKEY LEG SHIT.'], nude: ['HANK NO LIKE LITTLE MAN DINGUS.'] },
  chet: { clean: ['FASTPASS, BRO. FAST AND DEADLY.', "WAND BOLT, BRO. I PUT IT ON MY DAD'S AMEX."], shitty: ['DID YOU SHIT ON A BROOM, BRO? WOW.'], nude: ["NAKED BROOM GUY. I'M SENDING THIS TO THE GROUP CHAT."] },
  thaddeus: { clean: ['TWELVE YEARS OF BROOM FLIGHT. YOU HAVE TWELVE SECONDS.', "YOUR FORM IS ATROCIOUS. MY MOM'S BASEMENT HAS BETTER FORM."], shitty: ['YOU HAVE SOILED A SACRED BROOM.'], nude: ['NO ROBE. SPLINTERS IN THE SCROTUM. AMATEUR.'] },
  dmitri: { clean: ['VIP COMING THROUGH. MOVE OR DIE.', 'I INJECT HORSE TESTOSTERONE. YOU INJECT CHEETOS.'], shitty: ['YOU FLY LIKE YOU SHIT. ALL OVER.'], nude: ['SO SMALL. I NEED SNIPER WAND.'] },
  brody: { clean: ['LATE ENTRY, BRO. EARLY FUNERAL. YOURS.', 'I PAID FIFTY BUCKS CASH TO KILL YOU. NO RECEIPT.'], shitty: ['FIFTY BUCKS AND I GOTTA SMELL YOU?'], nude: ['I DIDN\'T PAY TO SEE THAT.'] },
  sven: { clean: ['SVEN COMES FOR YOUR HEAD!', "SVEN'S HORNS GO IN YOUR ASS! SVEN PROMISES!"], shitty: ['YOU SMELL LIKE A LONGHOUSE TOILET.'], nude: ['SVEN HAS SEEN BIGGER ON A GOAT.'] },
  sebastian: { clean: ['A PRINCE NEVER MISSES.', 'HOLD STILL, PEASANT. FATHER OWNS A GOLF COURSE.'], shitty: ['UGH. A PEASANT WITH DIARRHEA.'], nude: ['COVER YOURSELF, PEASANT. I\'M AIMING.'] },
};
/** At each other (one of them's going for another). */
export const RIVAL: Record<FlyerId, string[]> = {
  blake: ['MOVE, BRO! SHE\'S MINE!', 'OUT OF MY SKY, BRO!'],
  rafael: ['FEWER SUITORS, MORE PIPER.', 'NOTHING PERSONAL. YOU HAVE A WEAK CHIN.'],
  hank: ['HAVE AT THEE!', 'FOR PIPER! AND TURKEY LEG!'],
  chet: ['SORRY, BRO! NOT SORRY!', 'BRO CODE DOESN\'T COUNT UP HERE!'],
  thaddeus: ['AMATEURS. ALL OF YOU.', 'OUT OF MY FLIGHT PATH, NORMIE.'],
  dmitri: ['I KILL ALL OF YOU. THEN THE LITTLE MAN.', 'YOU ARE IN MY WAY. I BREAK YOUR SPINE LIKE BREADSTICK.'],
  brody: ['FIFTY BUCKS SAYS YOU DIE FIRST.', 'MOVE, BRO! I GOT A TAN AT FOUR!'],
  sven: ['VALHALLA FOR YOU!', 'SVEN SHARES NOTHING!'],
  sebastian: ['MOVE, COMMONER.', 'THE CROWN SAYS DIE.'],
};
/** Going down (the spiral: a scream and a shit). */
export const DIE: Record<FlyerId, string[]> = {
  blake: ['NOT LIKE THIS, BROOO!', 'MY GAINS! MY BEAUTIFUL GAINS!'],
  rafael: ['NOT THE FACE! NOT THE FAAACE!', 'MY VENEERS ARE STILL FINANCED!'],
  hank: ['MY TURKEY LEGS!', 'HANK SHIT! HANK SHIT IN AIR!'],
  chet: ['FASTPASS TO HELL, BROOO!', 'I SHIT MYSELF, BRO!'],
  thaddeus: ['MY VINTAGE BROOM!', 'THIS NEVER HAPPENS AT CONVENTIONS!'],
  dmitri: ['I PAID FOR VIP!', 'MOTHER! I PISS MYSELF!'],
  brody: ['I WANT MY FIFTY BUCKS BACK!', 'NOT WORTH FIFTY BUCKS!'],
  sven: ['VALHALLAAA!', 'SVEN SHIT HIMSELF!'],
  sebastian: ['I\'M ROYALTY!', "CALL MY FATHER'S LAWYER!"],
};

// ---------------------------------------------------------------------------------------------------------------
// What hurts him up here, and the death screens (28 characters at most)

export const SRC = {
  bolt: 'm2:fa_bb_bolt', snipe: 'm2:fa_bb_snipe', shaker: 'm2:fa_bb_shaker', dumbbell: 'm2:fa_bb_dumbbell',
  turkey: 'm2:fa_bb_turkey', ram: 'm2:fa_bb_ram', tower: 'm2:fa_bb_tower',
} as const;
export const HURT: HurtTable = {
  [SRC.bolt]: { hurt: ['WAND BOLT! IN THE ASS!', 'A GIFT SHOP WAND SHOT ME!', 'THE WAND BURNED A HOLE IN MY NIPPLE!'], death: ['SHOT DOWN BY A GIFT WAND', 'ZAPPED OFF A BROOMSTICK'] },
  [SRC.snipe]: { hurt: ['SNIPED! BY A NERD!', 'THAT WAND HAS A SCOPE!', 'A VIRGIN SNIPED ME!'], death: ['SNIPED OFF A BROOM', 'SHOT DOWN BY A WIZARD'] },
  [SRC.shaker]: { hurt: ['A PROTEIN SHAKE! AT ALTITUDE!', 'WHEY! AT TWO HUNDRED FEET!', 'CHOCOLATE WHEY! MY EYES!'], death: ['SHAKEN OFF A BROOM', 'WHEYED OUT OF THE SKY'] },
  [SRC.dumbbell]: { hurt: ['A DUMBBELL! FROM ABOVE!', 'FORTY POUNDS! TO THE HEAD!', 'HE THREW HIS DUMBBELL! DUMBBELL!'], death: ['DUMBBELLED OUT OF THE SKY', 'DIED DOING HIS REPS'] },
  [SRC.turkey]: { hurt: ['A TURKEY LEG! GREASY!', 'HIT BY A DRUMSTICK!', 'A TURKEY LEG! HALF EATEN!'], death: ['DOWNED BY A TURKEY LEG', 'DRUMSTICKED TO DEATH'] },
  [SRC.ram]: { hurt: ['RAMMED! BY A BROOM!', 'HE FLEW A BROOM UP MY ASS!', 'BROOM HANDLE! IN MY GUT!'], death: ['RAMMED OFF A BROOMSTICK', 'JOUSTED OUT OF THE SKY'] },
  [SRC.tower]: { hurt: ['I FLEW INTO A TOWER!', 'STONE! FACE FIRST!', 'WHO PUT A FUCKING CASTLE THERE?'], death: ['FLEW INTO A CASTLE', 'BROOM MEETS WALL'] },
};

/** The announcer's calls, by how they went down. */
export const KILL_CALLS = {
  ground: ['GROUNDED!', 'LAWN DART!'],
  wall: ['WALL ART!', 'FLY SWATTED!'],
  moat: ['MUD BATH!', 'MOAT-ALITY!'],
  infight: ['FRIENDLY FIRE!', 'BACKSTABBED!'],
} as const;

export const VOICE_LINES: Record<string, string[]> = {
  meathead: [...[MH_START, MH_AGAIN, MH_KILL, MH_INFIGHT, MH_WALL, MH_LATE, MH_LAST, MH_WIN].flatMap(allOf), ...Object.values(HURT).flatMap(h => h.hurt)],
  death: Object.values(HURT).flatMap(h => h.death),
  announcer: [...new Set(Object.values(KILL_CALLS).flat())],
  [PIPER_PA_VOICE]: [...PIPER_START, ...PIPER_KILL, ...PIPER_INFIGHT, ...PIPER_LATE, ...PIPER_LAST, ...PIPER_WIN, ...PIPER_WALL],
  ...Object.fromEntries((Object.keys(BROOM_VOICES) as FlyerId[]).map(id => [BROOM_VOICES[id], [...allOf(TAUNT[id]), ...RIVAL[id], ...DIE[id]]])),
};
