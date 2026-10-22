// Every line said in real hell, by voice id (the voice pack records these: spooky/voices.ts gathers them;
// tools/voices/m2pack.ts and extract.ts take them from there). Meathead's lines go under 'meathead', the death screen's
// under 'death', the demon's under 'm2.demon', Satan's under 'm2.satan'. The clean / shitty / naked pools are all the
// same size wherever lines react to how he is.

export type Dressed = 'clean' | 'shitty' | 'nude';
export type ByPants = Record<Dressed, readonly string[]>;
const all = (r: ByPants) => [...r.clean, ...r.shitty, ...r.nude];

// The demon's fight (his lines, Meathead's about him, the death screen's): demonLines.ts.
export * from './demonLines';
import { DEMON_VOICE_LINES } from './demonLines';

// ---------------------------------------------------------------------------------------------------------------
// Meathead

/** Down the pit from the top of the clock tower: landing in the wreck. */
export const MH_LANDED = ['OW. I LANDED ON A GUY.', "SOFT LANDING. SORRY, BUDDY. YOU'RE A PANCAKE NOW.", "WELL. THAT'S NOT THE GIFT SHOP."];
/** ...and a look at what's left of the riders. */
export const MH_BODIES = ["THAT RIDE'S GETTING ONE STAR.", "THAT GUY'S IN SIX PLACES.", "SOMEBODY'S GONNA HAVE TO MOP THAT. NOT ME. I'M A GUEST."];
/** The first lava. */
export const MH_LAVA = ["OKAY. THAT'S REAL LAVA.", 'THEY OUTSOURCED THE HELL RIDE TO ACTUAL HELL.', 'SMELLS LIKE A PORTA-POTTY AT A CHILI COOK-OFF.'];
/** Another car down the shaft (the ride's still boarding). */
export const MH_CAR = ["THEY KEEP SENDING 'EM DOWN!", 'WHO IS STILL GETTING ON THAT THING?! THE LINE MUST BE A MILE!', 'SHUT THE RIDE DOWN, YOU IDIOTS!'];
/** Satan coming up out of the lava. */
export const MH_SATAN = ['OH. HI. NICE HORNS. COMPENSATING?', "...THAT'S HIS DAD.", "OH SHIT. THAT'S A LOT OF DEVIL."];
/** The ground going hot under his feet. */
export const MH_LAUNCH = ["WAIT, WHAT'S IT DOING-", "IT'S GETTING REAL HOT UNDER MY-", 'OH, COME ON-'];

// What he says when these hurt him (the death screen's when they kill him).
export const HURT_LAVA = ['HOT FOOT! HOT FOOT!', 'MY TOES ARE COOKING! I SMELL LIKE A BARBECUE!', "I'M SEARED! I'M A STEAK!"];
export const DEATH_LAVA = ['WELL DONE', 'DIPPED IN HELL', 'SOUP OF THE DAMNED'];
export const HURT_JET = ['THE FLOOR FARTED FIRE AT ME!', "THE FLOOR'S GOT THE HOT FARTS!", 'FIRE UP THE ASS! FIRE UP THE ASS!'];
export const DEATH_JET = ['FLAME-BROILED', 'VENTED', 'ROASTED FROM BELOW'];
export const HURT_CAR = ['AN ELEVATOR FELL ON ME!', "WHO'S STILL RIDING THIS THING?!", 'THE RIDE LANDED ON MY HEAD!'];
export const DEATH_CAR = ['GOING DOWN. NOT LIKE THAT.', 'MIND THE DOORS', 'ELEVATED TO HELL'];
export const HURT_IMP = ['THE LITTLE RED FUCKER BIT MY ANKLE!', 'GET OFF ME, YOU RED GOBLIN TURD!', "IT'S A CHIHUAHUA FROM HELL!"];
export const DEATH_IMP = ['NIBBLED BY AN IMP', 'ANKLE-BITTEN', 'KILLED BY A HELL CHIHUAHUA'];
export const HURT_IMP_FIRE = ['IT THREW FIRE AT ME! LITTLE PRICK!', 'FIREBALL! RIGHT IN MY MOUTH!', 'QUIT LOBBING THAT SHIT!'];
export const DEATH_IMP_FIRE = ['FIREBALLED', 'LOBBED TO DEATH', 'TOASTED BY A TODDLER DEVIL'];
export const HURT_HOUND = ['IT BIT MY ASS AND MY ASS IS ON FIRE!', "IT BIT ME AND IT'S ON FIRE!", "WHO'S A GOOD BOY?! NOT YOU, ASSHOLE!"];
export const DEATH_HOUND = ['CHEW TOY OF THE DAMNED', 'HOUNDED', 'ALPO OF THE DAMNED'];
export const HURT_BAT = ['FLAMING BAT ON MY HEAD!', 'GET OUT OF MY FACE, YOU FLYING RAT!', "MY HAIR'S ON FIRE! MY BACK HAIR TOO!"];
export const DEATH_BAT = ['BAT OUT OF HELL', 'TORCHED BY A BAT', 'BATTERED'];
export const HURT_GOAT = ['THE GOAT SMELLS WORSE THAN ME!', 'IT HEADBUTTED MY KIDNEYS!', 'FUCKING DEVIL GOAT HEADBUTTED MY NUTS!'];
export const DEATH_GOAT = ['GOATED', 'BUTTED TO DEATH', 'BAAAAD END'];
/** Shoulder charged into a hell goat's horns. */
export const HURT_HORNS = ['I CHARGED INTO THE HORNS!', 'SHOULDER, MEET HORN! OW! FUCK!', 'WHY DID I RAM THE POINTY GOAT?!'];
export const DEATH_HORNS = ['RAMMED THE WRONG GOAT', 'HORNED', 'SHISH-KA-GOAT'];

// ---------------------------------------------------------------------------------------------------------------
// Satan: up out of the lava after his boy's gone crying to him. The core line's always the same; what follows it is
// by the state of Meathead's pants.

export const SATAN_CORE = 'MEATHEAD. ONE OF THESE DAYS YOUR SOUL WILL BE MINE FOREVER. THAT TIME IS NOT NOW.';
export const SATAN_PARTING: ByPants = {
  clean: ['NOW GET OUT OF MY HOUSE.', 'AND STOP HITTING MY SON. HE IS SENSITIVE.'],
  shitty: ['AND YOU SHAT IN MY HOUSE. GET OUT.', 'EVEN HELL HAS STANDARDS. GO WASH.'],
  nude: ['AND PUT SOMETHING ON. EVEN I HAVE LIMITS.', 'I HAVE SEEN EVERY SIN THERE IS. COVER THAT ONE.'],
};

export const VOICE_LINES: Record<string, string[]> = {
  meathead: [
    ...MH_LANDED, ...MH_BODIES, ...MH_LAVA, ...MH_CAR, ...MH_SATAN, ...MH_LAUNCH,
    ...HURT_LAVA, ...HURT_JET, ...HURT_CAR, ...HURT_IMP, ...HURT_IMP_FIRE, ...HURT_HOUND, ...HURT_BAT, ...HURT_GOAT, ...HURT_HORNS,
    ...DEMON_VOICE_LINES.meathead,
  ],
  death: [...DEATH_LAVA, ...DEATH_JET, ...DEATH_CAR, ...DEATH_IMP, ...DEATH_IMP_FIRE, ...DEATH_HOUND, ...DEATH_BAT, ...DEATH_GOAT, ...DEATH_HORNS, ...DEMON_VOICE_LINES.death],
  'm2.demon': DEMON_VOICE_LINES['m2.demon'],
  'm2.satan': [SATAN_CORE, ...all(SATAN_PARTING)],
};
