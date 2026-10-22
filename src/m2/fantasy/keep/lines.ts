// What's said in the castle's base and on the runway, by voice (fantasy/voices.ts gathers it; tools/voices records it).
// In the user's voice: blunt, short, vulgar, specific; talk less; fit the trigger. Picked with pickLine. Meathead's lines
// and everybody reacting to him in clean / shitty / naked pools. The cast are the castle's cast members in costume
// (they break character to yell at him); Piper's on the PA, closer now and hungrier for it (her lust is for being fought
// over: purring over the blood, coy about the prize); the suitors left trash-talk him. Pure data.

import { allOf, PIPER_PA_VOICE, type ByPants, type HurtTable } from '../talk';

/** The castle's new voices (cast.json); the guards use the square's cast voices (a man's, a woman's). The suitors left
 *  from the ride keep their glen voices; the FASTPASS suitors are new. */
export const KEEP_VOICES = {
  jester: 'm2.fantasy.jester', jesterf: 'm2.fantasy.jesterf',
  courtier: 'm2.fantasy.courtier', courtierf: 'm2.fantasy.courtierf',
  guard: 'm2.fantasy.castman', guardf: 'm2.fantasy.castwoman',
  blake: 'm2.fantasy.suitor_blake', rafael: 'm2.fantasy.suitor_rafael', hank: 'm2.fantasy.suitor_hank',
  chet: 'm2.fantasy.suitor_chet', thaddeus: 'm2.fantasy.suitor_thaddeus', dmitri: 'm2.fantasy.suitor_dmitri',
} as const;

// ---------------------------------------------------------------------------------------------------------------
// Meathead

/** In at the castle's gate, off the ride. */
export const ARRIVE: ByPants = {
  clean: ['THE CASTLE. SOMEWHERE IN THERE IS A BED WITH MY NAME ON IT.', "TWO TRIALS DOWN. PIPER, I'M AT YOUR GATE."],
  shitty: ["I'M AT HER CASTLE WITH A LOAD IN MY PANTS.", "TWO TRIALS DOWN. MY UNDERWEAR DIDN'T MAKE IT."],
  nude: ['NAKED AT HER GATE. SAVES HER A STEP.', 'TWO TRIALS DOWN. MY DICK IS POINTING THE WAY.'],
};
/** Things he's got to say passing them (once each). */
export const GAGS: Record<'bridge' | 'holes' | 'shop' | 'boutique' | 'roses' | 'walls' | 'tower', ByPants> = {
  bridge: {
    clean: ['A DRAWBRIDGE. JUST LET ME IN, LADY.', 'LOWER THE BRIDGE, PIPER. I BROUGHT THE MEAT.'],
    shitty: ['A MOAT. I COULD RINSE MY ASS OFF. NO TIME.', 'DRAWBRIDGE IS OPEN. SO ARE MY BOWELS.'],
    nude: ['A DRAWBRIDGE. MINE IS ALREADY UP.', 'THE BRIDGE IS UP. SO AM I.'],
  },
  holes: {
    clean: ['THEY POUR HOT BUTTER ON YOU. FROM THE CEILING.', "MURDER HOLES. THAT'S WHAT THEY'RE REALLY CALLED. LOOK IT UP."],
    shitty: ["HOT BUTTER ON TOP. SHIT ON THE BOTTOM. I'M A PANINI.", 'BUTTER FROM ABOVE. MY PANTS ARE ALREADY GREASY.'],
    nude: ['HOT BUTTER AND NO PANTS. WATCH THE BALLS.', "BOILING BUTTER ON BARE BALLS. THAT'S A WAR CRIME."],
  },
  shop: {
    clean: ['A GIFT SHOP IN THE GATEHOUSE. OF COURSE.', 'FORTY BUCKS FOR A TIARA. MADE IN A CHINESE PRISON.'],
    shitty: ['A GIFT SHOP. NO PANTS FOR SALE. JUST TIARAS.', 'SIXTY BUCKS FOR A CAPE. NOT ONE PAIR OF UNDERWEAR.'],
    nude: ['A GIFT SHOP. NO PANTS. JUST CAPES.', 'NAKED IN A GIFT SHOP. TOUCHED EVERY PLUSH.'],
  },
  boutique: {
    clean: ['A PRINCESS MAKEOVER. I AM ALREADY A TEN.', 'BIBBIDI BOBBIDI BULLSHIT. NINETY-NINE NINETY-FIVE.'],
    shitty: ['A MAKEOVER. START WITH MY PANTS.', "THEY CAN'T MAKE OVER THESE PANTS. THEY NEED A PRIEST."],
    nude: ['A MAKEOVER? LOOK AT THIS. NO NOTES.', "NAKED PAST A PRINCESS SALON. THEY'RE TAKING PICTURES."],
  },
  roses: {
    clean: ['ROSES. THORNY ONES. ROMANTIC AND STABBY.', "I'LL PICK HER A ROSE. AND A CONDOM FROM THE GIFT SHOP."],
    shitty: ['ROSES. THEY SMELL BETTER THAN ME.', 'A ROSE GARDEN. IT NEEDS FERTILIZER. I HAVE SOME.'],
    nude: ['THORNS AGAIN. THIS LAND HATES MY NUTSACK.', 'ROSE BUSHES AT DICK HEIGHT. GREAT DESIGN.'],
  },
  walls: {
    clean: ['THE RAMPARTS. EVERYBODY UP HERE HAS A POINTY STICK.', "UP ON THE WALL. I CAN SEE HER TOWER. IT'S VERY PHALLIC."],
    shitty: ["UP ON THE WALL. THE WIND'S CARRYING MY SMELL TO ORLANDO.", 'RAMPARTS. THE GUARDS CAN SMELL ME COMING.'],
    nude: ['NAKED ON THE WALL. THE WHOLE PARKING LOT CAN SEE.', 'UP ON THE RAMPARTS. FLAPPING IN THE WIND.'],
  },
  tower: {
    clean: ['MORE MOVING STAIRS. HER BEDROOM BETTER BE WORTH IT.', 'UP THE TOWER. EVERY STEP, ONE STEP CLOSER TO SEX.'],
    shitty: ['MORE STAIRS. MY PANTS ARE SLIDING DOWN THEM.', 'CLIMBING A TOWER IN SHIT PANTS. FOR PUSSY.'],
    nude: ['MORE STAIRS. MY BALLS ARE GETTING A WORKOUT.', 'UP THE TOWER. IT IS NOT THE ONLY THING UP.'],
  },
};
/** His answer to the suitors at the boutique. */
export const SHOP_RETORT: ByPants = {
  clean: ['NICE TIARAS, LADIES. VERY PRINCESS. VERY VIRGIN.', "YOU GOT A MAKEOVER? YOU'RE STILL UGLY."],
  shitty: ['MAKE ME OVER. START WITH THE PANTS.', 'CUCUMBER FACE MASK? I GOT A CHILI ASS MASK.'],
  nude: ["I DON'T NEED A MAKEOVER. LOOK AT THIS.", 'MAKE OVER THIS, YOU POWDERED FUCKS.'],
};
/** On the broom (the runway's scene), blunt and horny. */
export const MOUNT: ByPants = {
  clean: ['A BIG STICK BETWEEN MY LEGS. TWO, ACTUALLY.', "LAST MAN FLYING GETS LAID. I'M FLYING."],
  shitty: ["BRISTLES IN MY SHIT PANTS. LET'S GO.", 'I RIDE THIS BROOM TO HER BED. SHE WILL SMELL ME COMING.'],
  nude: ['BARE ASS ON A BROOMSTICK. SPLINTERS. WORTH IT.', 'NAKED ON A BROOM. THE BRISTLES ARE TICKLING MY TAINT.'],
};
/** Back on the runway later: the brooms gone, the deck empty. */
export const EMPTY: ByPants = {
  clean: ['NO MORE BROOMS. NO MORE SUITORS.', "THE BROOM PORT. EMPTY. THEY'RE ALL DEAD. I DID THAT."],
  shitty: ['THE BROOMS ARE GONE. MY DIGNITY TOO.', 'EMPTY DECK. SMELLS LIKE VICTORY. VICTORY SMELLS LIKE SHIT.'],
  nude: ['EMPTY RUNWAY. NAKED VICTORY LAP.', 'NO BROOMS. NO SUITORS. JUST MY DICK IN THE BREEZE.'],
};

// ---------------------------------------------------------------------------------------------------------------
// Piper on the PA (closer now, hungrier), and at the runway

export const PIPER_KEEP: Record<string, string[]> = {
  gate: ["YOU'RE AT MY DOOR, BOYS. I CAN HEAR YOU BREATHING.", "CLOSER NOW. I CAN SMELL THE BLOOD. I'M IN MY ROBE."],
  court: ['BLEED ON MY FLAGSTONES. THE JANITOR NEEDS THE HOURS.', "I'M WATCHING FROM MY WINDOW. DON'T BORE ME."],
  tower: ['ALMOST UP. KILL ANYTHING IN YOUR WAY. FOR ME.', 'I MOVED THE STAIRS FOR YOU, DARLING. THEY COST A FORTUNE. SUFFER.'],
  postern: ['THE BROOMS ARE WAITING. SO AM I. HUNGRY.', 'ONE MORE TRIAL. MAKE IT A BLOODBATH.'],
};
export const PIPER_FINAL = ['FINAL TRIAL, BOYS. BROOMSTICK DEATHMATCH.', 'THE LAST TRIAL. BROOMSTICKS. TO THE DEATH.'];
export const PIPER_RULES = ['LAST MAN FLYING GETS MY WINDOW. THE HIGHEST ONE.', 'KNOCK EACH OTHER OUT OF MY SKY. THE LAST ONE UP GETS IN.'];
export const PIPER_GO = ['GO. MAKE IT RAIN BLOOD, BOYS.', 'FLY. AND BLEED FOR ME.'];

// ---------------------------------------------------------------------------------------------------------------
// The suitors: at the boutique (the ones the ride didn't kill), and on the runway

type Rid = 'blake' | 'rafael' | 'hank';
export const SHOP_SAY: Record<Rid, ByPants> = {
  blake: {
    clean: ['THE FACE MASK IS FOR HER, BRO. AND MY BACK ACNE.', 'YOU LIVED? I PAID A GUY TO LOOSEN YOUR DRAGON.'],
    shitty: ['GET OUT, BRO. MY CUCUMBERS JUST WILTED.'],
    nude: ['THEY DO BALL WAXING HERE, BRO. TWO-MINUTE JOB FOR YOU.'],
  },
  rafael: {
    clean: ['A PRINCE NEEDS HIS GLOW. YOU NEED A MIRACLE.', 'THE TIARA STAYS ON DURING SEX. FOR HER.'],
    shitty: ['THE MANICURIST QUIT. YOU DID THAT.'],
    nude: ['EVEN THE NAIL LADY LAUGHED AT IT.'],
  },
  hank: {
    clean: ['HANK GET TIARA. HANK IS PRINCESS NOW.', "DON'T LOOK AT HANK. HANK MASK IS SETTING."],
    shitty: ['LITTLE MAN NO SIT IN HANK CHAIR. EVER.'],
    nude: ['HANK SEEN BIGGER THING ON A BABY CARROT.'],
  },
};
/** The trash talk on the runway: the ones from the ride, and the FASTPASS boys (who paid to skip the trials). */
export const RUNWAY_SAY: Record<Rid | 'chet' | 'thaddeus' | 'dmitri', ByPants> = {
  blake: {
    clean: ['LAST ONE IN THE AIR. LAST TIME YOU BREATHE.', 'THIS BROOM HAS A SPOILER, BRO. A SPOILER.'],
    shitty: ["DON'T FLY BEHIND ME. I'M NOT BREATHING THAT."],
    nude: ["BRO. YOU'RE SITTING ON A BROOM NAKED."],
  },
  rafael: {
    clean: ["SHE'LL SEE ME FROM HER WINDOW. FLAWLESS.", 'I FLY FIRST CLASS. YOU FLY SPIRIT AIRLINES.'],
    shitty: ['YOU WILL FALL OUT OF THE SKY LIKE A TURD FROM A PIGEON.'],
    nude: ['NO PANTS ON A BROOM. YOU ANIMAL.'],
  },
  hank: {
    clean: ['I WILL KNOCK YOU OUT OF THE SKY.', 'HANK BROOM CREAK. HANK EAT FOUR TURKEY LEG.'],
    shitty: ['HANK FLY UPWIND. FAR UPWIND.'],
    nude: ['HANK NOT WANT TINY THING ON HANK BROOM.'],
  },
  chet: {
    clean: ['WE HAD FASTPASS, BRO. SKIPPED THE TRIALS.', "FASTPASS. MY DAD'S A DENTIST. LOL."],
    shitty: ["FASTPASS, BRO. AND WE DIDN'T SHIT OURSELVES."],
    nude: ["FASTPASS AND PANTS. THE TWO THINGS YOU DON'T HAVE."],
  },
  thaddeus: {
    clean: ["I'VE FLOWN BROOMS AT CONVENTIONS FOR TWELVE YEARS.", 'MY BROOM IS HANDMADE. I HAVE NEVER TOUCHED A WOMAN.'],
    shitty: ['DO NOT TOUCH MY BROOM. IT IS VINTAGE.'],
    nude: ["NO ROBE ON A BROOM. YOU'LL GET A SPLINTER IN YOUR TAINT."],
  },
  dmitri: {
    clean: ['I SKIP TRIALS. I DO NOT SKIP STEROIDS.', 'I PAID FOR VIP. I GET VIP. YOU GET DEAD.'],
    shitty: ['YOU SMELL LIKE LOSING, LITTLE MAN.'],
    nude: ['IN MY COUNTRY, WE CALL THAT A PEANUT.'],
  },
};
/** Shot at on the runway: it bounces off them. */
export const RUNWAY_BOUNCE = ['SAVE IT FOR THE SKY, LOSER.', 'HA. MISSED, DICKHEAD.'];

// ---------------------------------------------------------------------------------------------------------------
// The cast (barks: rare, short, broken character)

export const GUARD_BARK: ByPants = {
  clean: ['HALT! WHO GOES THERE? DOESN\'T MATTER!', 'HALT! THIS HALBERD IS PLASTIC! MOSTLY!', 'NO GUESTS PAST THIS POINT! MY BOSS IS A CUNT!'],
  shitty: ['HALT! YOU REEK!', "THE SMELL STOPS HERE! IT'S IN MY CONTRACT!"],
  nude: ['HALT! PANTS REQUIRED IN THE CASTLE!', 'COVER THAT OR I POKE IT! WITH THE POINTY END!'],
};
export const JESTER_BARK: ByPants = {
  clean: ['HEY NONNY NONNY! DIE!', 'WHY DID THE GUEST CROSS THE MOAT? HE DIDN\'T!', 'I HAVE A THEATER DEGREE! AND HERPES!'],
  shitty: ["WHAT SMELLS? OH, IT'S YOU!", 'HE SHAT HIS TIGHTS! HA!'],
  nude: ["A NAKED MAN! NOW THAT'S COMEDY!", "THAT'S A SHORT JOKE! A REAL SHORT ONE!"],
};
export const COURTIER_BARK: ByPants = {
  clean: ['HOW DARE YOU! THE GREAT PIXIE IS RESTING!', 'BACK, PEASANT! YOU COST THIRTY TWO DOLLARS!', 'HER GRACE SEES NO ONE. UNLESS THEY WIN.'],
  shitty: ['UGH! THE SMELL! FAN ME!', 'PEASANT! YOU SOILED YOURSELF!'],
  nude: ['MY EYES! COVER IT!', "I'VE SEEN BIGGER ON THE KING'S LAPDOG!"],
};

// ---------------------------------------------------------------------------------------------------------------
// What hurts him here, and the death screens (28 characters at most)

export const HURT: HurtTable = {
  'm2:fa_guard': { hurt: ['THE GUARD STABBED ME!', 'HALBERD! IN THE GUT!', 'AN HOURLY GUARD JUST STABBED ME!'], death: ['SKEWERED BY A GUARD', 'HALBERD TO THE HEART'] },
  'm2:fa_halberd': { hurt: ['I CHARGED A HALBERD!', 'I RAN RIGHT ONTO HIS POLE! NO HOMO!', 'HALBERD! RIGHT IN THE PECS!'], death: ['CHARGED A HALBERD', "RAN ONTO A GUARD'S POLE"] },
  'm2:fa_jester': { hurt: ['BONKED BY A JESTER!', 'HIT WITH A BALLOON ON A STICK!', 'THE CLOWN HIT ME WITH HIS BALLS!'], death: ['BONKED BY A JESTER', 'KILLED BY THE COMEDY'] },
  'm2:fa_pin': { hurt: ['A JUGGLING PIN! TO THE FACE!', 'HE THREW HIS PINS AT ME!', 'HE JUGGLED THEM INTO MY NUTS!'], death: ['JUGGLED TO DEATH', 'KILLED BY JUGGLING PINS'] },
  'm2:fa_courtier': { hurt: ['SHE SLAPPED ME!', 'A ROYAL SLAP!', "SHE SLAPPED ME LIKE I'M HER HUSBAND!"], death: ['SLAPPED TO DEATH', 'KILLED BY A LADY IN WAITING'] },
  'm2:fa_fan': { hurt: ['A FAN! IT CAME BACK!', 'THE FAN CUT ME!', 'A PAPER CUT ON MY NIPPLE!'], death: ['FANNED TO DEATH', 'DIED OF A PAPER CUT'] },
  'm2:fa_oil': { hurt: ['HOT BUTTER! FROM ABOVE!', 'BOILING BUTTER BREW! AAH!', "MY SKIN! IT'S BUTTERED!"], death: ['BOILED IN BUTTER BREW', 'BUTTERED TO DEATH'] },
  'm2:fa_roses': { hurt: ['ROSE THORNS! IN MY ASS!', 'ROSES! WHY ARE THEY STABBY?', 'A THORN IN MY PEEHOLE!'], death: ['DIED IN A ROSE BED', 'KILLED BY ROMANCE'] },
};

// ---------------------------------------------------------------------------------------------------------------
// The announcer's kill callouts, by kind

export const KILL_CALLS: Record<string, Record<string, string[]>> = {
  'm2:fa_guard': { charge: ['OFF DUTY!', 'DISMISSED!'], uppercut: ['SHIFT CHANGE!'], divekick: ['STAND DOWN!'] },
  'm2:fa_jester': { charge: ['NO JOKE!', 'PUNCHLINE!'], uppercut: ['BADA BING!'], divekick: ['TOUGH CROWD!'] },
  'm2:fa_courtier': { charge: ['CURTSY THIS!', 'DISMISSED FROM COURT!'], uppercut: ['LIGHTS OUT, MY LADY!'], divekick: ['FANNED OUT!'] },
};

const pools = (b: ByPants) => allOf(b);
export const VOICE_LINES: Record<string, string[]> = {
  meathead: [...[ARRIVE, SHOP_RETORT, MOUNT, EMPTY, ...Object.values(GAGS)].flatMap(allOf), ...Object.values(HURT).flatMap(h => h.hurt)],
  death: Object.values(HURT).flatMap(h => h.death),
  announcer: [...new Set(Object.values(KILL_CALLS).flatMap(k => Object.values(k).flat()))],
  [KEEP_VOICES.guard]: pools(GUARD_BARK), [KEEP_VOICES.guardf]: pools(GUARD_BARK),
  [KEEP_VOICES.jester]: pools(JESTER_BARK), [KEEP_VOICES.jesterf]: pools(JESTER_BARK),
  [KEEP_VOICES.courtier]: pools(COURTIER_BARK), [KEEP_VOICES.courtierf]: pools(COURTIER_BARK),
  [KEEP_VOICES.blake]: [...pools(SHOP_SAY.blake), ...pools(RUNWAY_SAY.blake), RUNWAY_BOUNCE[0]],
  [KEEP_VOICES.rafael]: [...pools(SHOP_SAY.rafael), ...pools(RUNWAY_SAY.rafael), RUNWAY_BOUNCE[1]],
  [KEEP_VOICES.hank]: [...pools(SHOP_SAY.hank), ...pools(RUNWAY_SAY.hank), RUNWAY_BOUNCE[0]],
  [KEEP_VOICES.chet]: [...pools(RUNWAY_SAY.chet), ...RUNWAY_BOUNCE],
  [KEEP_VOICES.thaddeus]: [...pools(RUNWAY_SAY.thaddeus), RUNWAY_BOUNCE[1]],
  [KEEP_VOICES.dmitri]: [...pools(RUNWAY_SAY.dmitri), RUNWAY_BOUNCE[0]],
  [PIPER_PA_VOICE]: [...Object.values(PIPER_KEEP).flat(), ...PIPER_FINAL, ...PIPER_RULES, ...PIPER_GO],
};
