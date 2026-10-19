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
  clean: ['LAST MAN FLYING GETS LAID. LET\'S FLY.', 'I NEVER FLEW A BROOM. HOW HARD CAN IT BE.'],
  shitty: ['FLYING WITH A LOAD IN MY PANTS. LOOK OUT BELOW.', 'IF I DROP SOMETHING, IT\'S NOT A BOMB. IT IS.'],
  nude: ['NAKED ON A BROOM. THE WIND IS IN MY EVERYTHING.', 'THE BONER IS POINTING AT HER WINDOW. FOLLOW IT.'],
};
/** Back up after dying. */
export const MH_AGAIN: ByPants = {
  clean: ['BACK ON THE BROOM.', 'ROUND TWO. SAME BROOM.'],
  shitty: ['BACK UP. STILL SHITTY.', 'AGAIN. THE BROOM SMELLS NOW.'],
  nude: ['BACK ON. SPLINTERS IN BAD PLACES.', 'NAKED AND BACK UP. STILL HARD.'],
};
/** He's killed one. */
export const MH_KILL: ByPants = {
  clean: ['ONE LESS DICK IN THE SKY.', 'GROUNDED. PERMANENTLY.', 'GET OFF MY BROOM LANE.', 'SHE WATCHED THAT. I KNOW IT.'],
  shitty: ['HE DIED SMELLING ME. FAIR.', 'DOWN YOU GO. I WENT DOWN MY PANTS.'],
  nude: ['KILLED BY A NAKED GUY. TELL YOUR FRIENDS.', 'DOWN HE GOES. UP I STAY. BOTH KINDS.'],
};
/** They killed one of their own. */
export const MH_INFIGHT: ByPants = {
  clean: ['THANKS FOR THE HELP, DIPSHIT.', 'KEEP KILLING EACH OTHER. LESS WORK.'],
  shitty: ['THEY\'RE DOING MY JOB. I\'LL JUST SIT HERE IN IT.'],
  nude: ['THEY KILL EACH OTHER. I JUST STAY HARD.'],
};
/** Turned back by the park's edge (the magic wall). */
export const MH_WALL: ByPants = {
  clean: ['A MAGIC WALL. SHE DOESN\'T WANT ME LEAVING.', 'THE PARK HAS A FORCE FIELD. OF COURSE IT DOES.'],
  shitty: ['THE WALL WON\'T LET ME OUT. OR MY SMELL.'],
  nude: ['THE FORCE FIELD ZAPPED MY BALLS.'],
};
/** The late entries fly in. */
export const MH_LATE: ByPants = {
  clean: ['MORE OF THEM? SHE SELLS TICKETS TO THIS?', 'LATE ENTRIES. LATE TO THEIR FUNERALS.'],
  shitty: ['NEW GUYS. THEY\'LL SMELL ME SOON.'],
  nude: ['MORE SUITORS. MORE WITNESSES TO THIS BONER.'],
};
/** One left. */
export const MH_LAST: ByPants = {
  clean: ['ONE LEFT. THEN THE WINDOW.', 'LAST ONE. PIPER, PUT ON SOMETHING NICE.'],
  shitty: ['ONE LEFT. THEN A SHOWER. THEN PIPER.'],
  nude: ['ONE LEFT. THE BONER CAN TASTE IT.'],
};
/** All dead: the rose barrier's down, at the window he goes. */
export const MH_WIN: ByPants = {
  clean: ['LAST MAN FLYING. PIPER, I\'M COMING IN.', 'THE WINDOW\'S OPEN. SO AM I.'],
  shitty: ['I WON. I\'M COMING IN HOT. AND BROWN.', 'HER WINDOW. HOPE SHE HAS A HOSE.'],
  nude: ['THE BONER KNOWS THE WAY. HOLD ON.', 'FULL MAST. FULL SPEED. HER WINDOW.'],
};

// ---------------------------------------------------------------------------------------------------------------
// Piper on the PA (the castle's horns)

export const PIPER_START = ['FLY, BOYS. AND BLEED ON MY LAWN.', 'THE WHOLE SKY IS YOURS. FILL IT WITH SCREAMING.'];
/** He's killed one. */
export const PIPER_KILL = ['OOH. HE WENT DOWN SPINNING.', 'MESSY. DO IT AGAIN.', 'THAT ONE SCREAMED SO PRETTY.', 'MORE. I WANT MORE.'];
/** They killed one of their own. */
export const PIPER_INFIGHT = ['YES. EAT EACH OTHER, BOYS.', 'ONE OF YOU KILLED A FRIEND. I FELT THAT.'];
/** The late entries (paid cash at the gate). */
export const PIPER_LATE = ['LATE ENTRIES, BOYS. THEY PAID CASH.', 'FRESH MEAT IN MY SKY. DON\'T BE RUDE.'];
/** One left. */
export const PIPER_LAST = ['TWO LEFT IN MY SKY. ONLY ONE GETS IN.', 'JUST YOU TWO. MAKE IT HURT.'];
/** All dead: her window's open. */
export const PIPER_WIN = ['LAST MAN FLYING. MY WINDOW\'S OPEN, DARLING.', 'THE ROSES ARE DOWN. COME UP AND SEE ME.'];
/** He's flown into the park's edge. */
export const PIPER_WALL = ['NO LEAVING, DARLING. NOT TILL THEY\'RE DEAD.'];

// ---------------------------------------------------------------------------------------------------------------
// The suitors

/** At him (his state), as they come at him. */
export const TAUNT: Record<FlyerId, ByPants> = {
  blake: { clean: ['EAT WHEY, BRO.', 'I GOT A PROTEIN SHAKE WITH YOUR NAME ON IT.'], shitty: ['YOU\'RE LEAKING ON THE GARDENS, BRO.'], nude: ['BRO. PUT IT AWAY. WE\'RE FLYING.'] },
  rafael: { clean: ['SHE\'S WATCHING. WATCH ME KILL YOU.', 'FLAWLESS FORM. YOURS IS TRASH.'], shitty: ['YOU\'RE A CROP DUSTER NOW.'], nude: ['I CAN SEE IT FROM HERE. SAD.'] },
  hank: { clean: ['JOUST ME, COWARD!', 'MY LANCE IS FOAM. MY HATE IS NOT.'], shitty: ['YOU SMELL LIKE THE TURKEY LEG STAND.'], nude: ['KEEP THAT AWAY FROM MY LANCE.'] },
  chet: { clean: ['FASTPASS, BRO. FAST AND DEADLY.', 'WAND BOLT, BRO. GIFT SHOP SPECIAL.'], shitty: ['DID YOU SHIT ON A BROOM, BRO? WOW.'], nude: ['NAKED BROOM GUY. I\'M POSTING THIS.'] },
  thaddeus: { clean: ['TWELVE YEARS OF BROOM FLIGHT. YOU HAVE TWELVE SECONDS.', 'YOUR FORM IS ATROCIOUS.'], shitty: ['YOU HAVE SOILED A SACRED BROOM.'], nude: ['NO ROBE. NO RESPECT. NO MERCY.'] },
  dmitri: { clean: ['VIP COMING THROUGH. MOVE OR DIE.', 'I HIT YOU LIKE LEG DAY.'], shitty: ['YOU FLY LIKE YOU SHIT. ALL OVER.'], nude: ['SO SMALL. SO EASY TO HIT.'] },
  brody: { clean: ['LATE ENTRY, BRO. EARLY FUNERAL. YOURS.', 'I PAID FIFTY BUCKS TO KILL YOU.'], shitty: ['FIFTY BUCKS AND I GOTTA SMELL YOU?'], nude: ['I DIDN\'T PAY TO SEE THAT.'] },
  sven: { clean: ['SVEN COMES FOR YOUR HEAD!', 'MY HORNS. YOUR ASS. MEET.'], shitty: ['YOU SMELL LIKE A LONGHOUSE TOILET.'], nude: ['SVEN HAS SEEN BIGGER ON A GOAT.'] },
  sebastian: { clean: ['A PRINCE NEVER MISSES.', 'HOLD STILL, PEASANT.'], shitty: ['UGH. A PEASANT WITH DIARRHEA.'], nude: ['COVER YOURSELF, PEASANT. I\'M AIMING.'] },
};
/** At each other (one of them's going for another). */
export const RIVAL: Record<FlyerId, string[]> = {
  blake: ['MOVE, BRO! SHE\'S MINE!', 'OUT OF MY SKY, BRO!'],
  rafael: ['FEWER SUITORS, MORE PIPER.', 'NOTHING PERSONAL. YOU\'RE UGLY.'],
  hank: ['HAVE AT THEE!', 'FOR PIPER! AND TURKEY!'],
  chet: ['SORRY, BRO! NOT SORRY!', 'BRO CODE DOESN\'T COUNT UP HERE!'],
  thaddeus: ['AMATEURS. ALL OF YOU.', 'OUT OF MY FLIGHT PATH.'],
  dmitri: ['I KILL ALL OF YOU. THEN THE LITTLE MAN.', 'YOU ARE IN MY WAY. NOT FOR LONG.'],
  brody: ['FIFTY BUCKS SAYS YOU DIE FIRST.', 'MOVE, BRO!'],
  sven: ['VALHALLA FOR YOU!', 'SVEN SHARES NOTHING!'],
  sebastian: ['MOVE, COMMONER.', 'THE CROWN SAYS DIE.'],
};
/** Going down (the spiral: a scream and a shit). */
export const DIE: Record<FlyerId, string[]> = {
  blake: ['NOT LIKE THIS, BROOO!', 'MY GAINS!'],
  rafael: ['NOT THE FACE! NOT THE FAAACE!', 'MY TIARA!'],
  hank: ['MY TURKEY LEGS!', 'TELL MY MOM I WAS A KNIGHT!'],
  chet: ['FASTPASS TO HELL, BROOO!', 'I SHIT MYSELF, BRO!'],
  thaddeus: ['MY VINTAGE BROOM!', 'THIS NEVER HAPPENS AT CONVENTIONS!'],
  dmitri: ['I PAID FOR VIP!', 'MOTHER!'],
  brody: ['I WANT MY FIFTY BUCKS BACK!', 'NOT WORTH IT!'],
  sven: ['VALHALLAAA!', 'SVEN SHIT HIMSELF!'],
  sebastian: ['I\'M ROYALTY!', 'CALL MY FATHER!'],
};

// ---------------------------------------------------------------------------------------------------------------
// What hurts him up here, and the death screens (28 characters at most)

export const SRC = {
  bolt: 'm2:fa_bb_bolt', snipe: 'm2:fa_bb_snipe', shaker: 'm2:fa_bb_shaker', dumbbell: 'm2:fa_bb_dumbbell',
  turkey: 'm2:fa_bb_turkey', ram: 'm2:fa_bb_ram', tower: 'm2:fa_bb_tower',
} as const;
export const HURT: HurtTable = {
  [SRC.bolt]: { hurt: ['WAND BOLT! IN THE ASS!', 'A GIFT SHOP WAND SHOT ME!', 'MAGIC! IT BURNS!'], death: ['SHOT DOWN BY A GIFT WAND', 'ZAPPED OFF A BROOMSTICK'] },
  [SRC.snipe]: { hurt: ['SNIPED! BY A NERD!', 'THAT WAND HAS A SCOPE!', 'RIGHT BETWEEN THE EYES!'], death: ['SNIPED OFF A BROOM', 'SHOT DOWN BY A WIZARD'] },
  [SRC.shaker]: { hurt: ['A PROTEIN SHAKE! AT ALTITUDE!', 'WHEY! IN THE SKY!', 'CHOCOLATE WHEY! MY EYES!'], death: ['SHAKEN OFF A BROOM', 'WHEYED OUT OF THE SKY'] },
  [SRC.dumbbell]: { hurt: ['A DUMBBELL! FROM ABOVE!', 'FORTY POUNDS! TO THE HEAD!', 'HE THREW HIS WEIGHTS!'], death: ['DUMBBELLED OUT OF THE SKY', 'DIED DOING HIS REPS'] },
  [SRC.turkey]: { hurt: ['A TURKEY LEG! GREASY!', 'HIT BY A DRUMSTICK!', 'POULTRY! IN MY FACE!'], death: ['DOWNED BY A TURKEY LEG', 'DRUMSTICKED TO DEATH'] },
  [SRC.ram]: { hurt: ['RAMMED! BY A BROOM!', 'HE FLEW RIGHT INTO ME!', 'BROOM HANDLE! IN MY GUT!'], death: ['RAMMED OFF A BROOMSTICK', 'JOUSTED OUT OF THE SKY'] },
  [SRC.tower]: { hurt: ['I FLEW INTO A TOWER!', 'STONE! FACE FIRST!', 'WHO PUT A CASTLE THERE?'], death: ['FLEW INTO A CASTLE', 'BROOM MEETS WALL'] },
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
