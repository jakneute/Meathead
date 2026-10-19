// Every line said in this section of Spooky Land, by voice id (the voice pack records these: spooky/voices.ts gathers
// them; tools/voices/m2pack.ts and extract.ts take them from there). Meathead's lines go under 'meathead'; anybody
// else's under their voice id (new speakers need an entry in tools/voices/cast.json). Keep the clean / shitty / naked
// pools the same size wherever lines react to how he is.
//
// The ballroom: Donnie Dracula ('m2.donnie': his real voice, whiny, Jersey), cowering, then given real power by Satan
// ('m2.satan': the omnipotent voice, out of the circle). Their two reasons, the same end: Satan wants Meathead's SOUL;
// Donnie just wants to show off his sick new powers (and kill him doing it). Every line by either of them three ways,
// all the same size: clean, shitty pants, naked. His sin is GLUTTONY: Satan wants a soul, Donnie wants a snack; he
// gorges on anybody he can get his fangs in, burps after every drink, and in the end eats himself to death.

import { type ByPants, all } from '../control/lines';
export type { ByPants, Dressed } from '../control/lines';

// ---- The intro (a cutscene)

/** Cowering in the corner: begging. */
export const DONNIE_PLEAD: ByPants = {
  clean: [
    "PLEASE DON'T HURT ME! I'M NOT REALLY DRACULA! I'M DONNIE! I HAVE A CONDO!",
    'OKAY, YOU WIN! TAKE MY EMPLOYEE DISCOUNT! TWELVE PERCENT! TAKE MY WINGS! THE CHICKEN ONES!',
    "DON'T HIT ME! I'M ON BLOOD THINNERS! I JUST ATE!",
  ],
  shitty: [
    "PLEASE DON'T HURT ME! I'M NOT REALLY DRACULA! I'M DONNIE! STAY OVER THERE!",
    'OKAY, YOU WIN! TAKE THE CAPE! WIPE WITH IT!',
    "DON'T HIT ME! AND DON'T SIT ON ANYTHING! THIS IS A RENTAL HALL!",
  ],
  nude: [
    "PLEASE DON'T HURT ME! I'M NOT REALLY DRACULA! I'M DONNIE! I'M JUST A GUY WHO SAW YOUR DICK!",
    'OKAY, YOU WIN! TAKE THE CAPE! PLEASE PUT IT ON!',
    "DON'T HIT ME! AND DON'T STAND LIKE THAT!",
  ],
};
/** The circle opens: Satan gives Donnie the power and wants Meathead's soul for it (short: the rest is in the fight).
 *  The fangs are for the soul; Donnie hears the fangs (and DONNIE_ENAMORED, the moment he's up: he wants a snack). */
export const SATAN_GRANT: ByPants = {
  clean: ['DONALD. STOP SNIVELING. TAKE MY POWER. BRING ME HIS SOUL. THE SOUL, DONALD. NOT A SNACK.', 'RISE, DONALD. FANGS. WINGS. NOW FETCH ME HIS SOUL. DO NOT EAT IT.', 'DONALD. BE WHAT YOUR NAME TAG PRETENDS. AND GET ME HIS SOUL. PUT DOWN THE CHICKEN.'],
  shitty: ['DONALD. TAKE MY POWER. BRING ME HIS SOUL. NOT A SNACK. YOU WOULD NOT WANT HIM ANYWAY.', 'RISE, DONALD. FETCH ME HIS SOUL. HOLD YOUR NOSE. AND YOUR APPETITE.', 'DONALD. TAKE MY POWER. I WANT HIS SOUL. NOT WHAT HE SAT IN. DO NOT EAT IT.'],
  nude: ['DONALD. TAKE MY POWER. BRING ME HIS SOUL. JUST THE SOUL. NOT A SNACK.', "RISE, DONALD. FETCH ME THE NAKED ONE'S SOUL. DO NOT EAT IT.", 'DONALD. HE CAME TO MY HOUSE NAKED. BRING ME HIS SOUL. PUT DOWN THE CHICKEN.'],
};

// ---- Satan and Donnie, mid-fight: two-line beats (Satan, then Donnie back at him), each at its moment. Their two
// reasons: Satan wants the soul; Donnie wants to show off. (Each pair's lines are picked apart: any Donnie line has to
// answer any Satan line in its pool.)

/** (now and then) Satan: the soul, Donald. (SATAN_NAG, below) ...and Donnie, showing off. */
export const DONNIE_SHOWOFF: ByPants = {
  clean: ['SOUL SCHMOUL! LOOK AT ME! I CAN FLY!', "RELAX! I'M KILLING HIM! AFTER A SNACK!", "YEAH, YEAH! I'M ON MY DINNER BREAK!"],
  shitty: ["SOUL SCHMOUL! IT'S CLEAN UP HERE!", "YOU WANT IT? YOU COME GET IT! I'M EATING!", "RELAX! I'M KILLING HIM! FROM UPWIND!"],
  nude: ["SOUL SCHMOUL! I'M NOT LOOKING DOWN THERE FOR IT!", "RELAX! I'M KILLING HIM! WITH MY EYES CLOSED!", 'YEAH, YEAH! THE NECK! RIGHT AFTER DESSERT!'],
};
/** (part way in) Satan's taunt: Donnie's soul too, one day. */
export const SATAN_SOUL: ByPants = {
  clean: ['ENJOY IT, DONALD. ONE DAY YOUR SOUL WILL BE MINE.', 'SHOW OFF ALL YOU LIKE. ONE DAY YOUR SOUL WILL BE MINE.', 'FLY, LITTLE BAT. ONE DAY YOUR SOUL WILL BE MINE.'],
  shitty: ['ENJOY IT, DONALD. ONE DAY YOUR SOUL WILL BE MINE. WASH IT FIRST.', 'SHOW OFF ALL YOU LIKE. ONE DAY YOUR SOUL WILL BE MINE. HIS TOO, HOSED DOWN.', 'FLY, LITTLE BAT. ONE DAY YOUR SOUL WILL BE MINE. HOLD YOUR BREATH TILL THEN.'],
  nude: ['ENJOY IT, DONALD. ONE DAY YOUR SOUL WILL BE MINE. DRESSED, I HOPE.', 'SHOW OFF ALL YOU LIKE. ONE DAY YOUR SOUL WILL BE MINE. HIS TOO. WITH PANTS ON.', 'FLY, LITTLE BAT. ONE DAY YOUR SOUL WILL BE MINE. TRY NOT TO LOOK DOWN.'],
};
/** ...and Donnie, hearing that (he flinches). */
export const DONNIE_SATAN_PANIC: ByPants = {
  clean: ["WAIT, MY SOUL?! I DIDN'T SIGN ANYTHING! DID I SIGN SOMETHING?!", "HEY! THAT WASN'T THE DEAL! WHAT WAS THE DEAL?!", "MINE?! I'M USING IT! I GOT A CONDO!"],
  shitty: ['WAIT, MY SOUL?! TAKE HIS! FOLLOW THE SMELL!', "HEY! THAT WASN'T THE DEAL! HIS IS HALFWAY OUT HIS ASS ALREADY!", 'MINE?! NO! TAKE THE SHITTY ONE!'],
  nude: ["WAIT, MY SOUL?! TAKE HIS! HE'S NOT USING ANYTHING!", "HEY! THAT WASN'T THE DEAL! I WANT A LAWYER!", "MINE?! NO! TAKE THE NAKED ONE! HE'S ALREADY UNWRAPPED!"],
};
/** (he's sucked a guest dry) Satan: wrong soul. */
export const SATAN_GUEST: ByPants = {
  clean: ['THAT WAS A TOURIST, DONALD. I WANT HIM.', 'I HAVE A MILLION OF THOSE. HIS, DONALD.', 'STOP EATING THE CUSTOMERS. FOCUS.'],
  shitty: ['THAT WAS A TOURIST, DONALD. I WANT THE ONE THAT SMELLS.', 'I HAVE A MILLION OF THOSE. HIS, DONALD. YES, EVEN HIS.', 'STOP EATING THE CUSTOMERS BECAUSE HE STINKS.'],
  nude: ['THAT WAS A TOURIST, DONALD. I WANT THE NAKED ONE.', 'I HAVE A MILLION OF THOSE. HIS, DONALD. ALL OF HIM.', 'STOP EATING THE CUSTOMERS. HE IS RIGHT THERE. NAKED.'],
};
/** ...Donnie back. */
export const DONNIE_GUEST: ByPants = {
  clean: ['I WAS HUNGRY! FLYING BURNS CALORIES!', "IT'S A WARM-UP! YOU STRETCH BEFORE YOU KILL A GUY!", 'THEY CUT IN LINE! THEY HAD IT COMING!'],
  shitty: ['THAT ONE SMELLED NORMAL! I NEEDED NORMAL!', "IT'S A PALATE CLEANSER! UGH!", 'YOU TRY BITING THAT!'],
  nude: ['THAT ONE HAD PANTS ON! I MISSED PANTS!', "I CAN'T BITE A NAKED GUY COLD! I GOTTA WORK UP TO IT!", 'YOU TRY GOING NECK FIRST AT THAT!'],
};
/** (the little statue's put him down) Satan, unimpressed. */
export const SATAN_STUN: ByPants = {
  clean: ['A PLASTIC JESUS, DONALD. YOU WERE FELLED BY A PLASTIC JESUS.', 'GET UP. IT GLOWS IN THE DARK. IT IS NOT EVEN A REAL ONE.', 'EMBARRASSING. DOWN TO A GIFT SHOP JESUS.'],
  shitty: ['A PLASTIC JESUS, DONALD. OUT OF HIS FILTHY BAG.', 'GET UP. HE SHAT HIMSELF. HE SHOULD BE ON THE FLOOR, NOT YOU.', 'EMBARRASSING. DOWN TO A SOUVENIR. FROM A MAN WHO SHAT HIMSELF.'],
  nude: ['A PLASTIC JESUS, DONALD. WHERE WAS HE EVEN KEEPING IT?', 'GET UP. DO NOT ASK WHERE IT HAS BEEN.', 'EMBARRASSING. DOWN TO A SOUVENIR. FROM A NAKED MAN.'],
};
/** ...Donnie, on the floor. */
export const DONNIE_STUN: ByPants = {
  clean: ["IT'S JESUS! HE THREW A LITTLE JESUS AT ME!", "YOU DIDN'T SAY ANYTHING ABOUT JESUS!", 'WHY DOES A TWO DOLLAR JESUS BURN?!'],
  shitty: ["IT'S JESUS! AND HE SMELLS LIKE ASS!", "YOU DIDN'T SAY ANYTHING ABOUT JESUS! OR THE SMELL!", 'IT BURNS AND IT STINKS! WHY BOTH?!'],
  nude: ["IT'S JESUS! WHERE WAS HE KEEPING JESUS?!", "YOU DIDN'T SAY ANYTHING ABOUT JESUS! OR DICKS!", 'IT BURNS! PLEASE LET IT BE THE JESUS!'],
};
/** (nearly done) Satan, getting ready to collect. */
export const SATAN_LOW: ByPants = {
  clean: ['YOU ARE FAILING, DONALD. I COULD COLLECT EARLY.', 'TICK TOCK, DONALD. YOUR SOUL OR HIS.', 'I AM SHARPENING SOMETHING, DONALD.'],
  shitty: ['YOU ARE LOSING TO A MAN WHO SHAT HIMSELF, DONALD.', 'TICK TOCK, DONALD. YOUR SOUL OR HIS. HIS STINKS.', 'I AM SHARPENING SOMETHING, DONALD. AND AIRING OUT A ROOM.'],
  nude: ['YOU ARE LOSING TO A MAN WITH NO PANTS, DONALD.', 'TICK TOCK, DONALD. YOUR SOUL, OR THE NAKED ONE.', 'I AM SHARPENING SOMETHING, DONALD. AND FINDING HIM A ROBE.'],
};
/** ...Donnie, panicking (he flinches). */
export const DONNIE_LOW: ByPants = {
  clean: ["I GOT THIS! I GOT THIS! I DON'T GOT THIS!", "GIMME A MINUTE! I'M DYING!", 'TIMEOUT! IS THERE TIMEOUTS IN HELL?!'],
  shitty: ["I GOT THIS! I JUST CAN'T BREATHE NEAR HIM!", "GIMME A MINUTE! I'M GAGGING!", 'TIMEOUT! AND A GAS MASK!'],
  nude: ["I GOT THIS! I JUST CAN'T LOOK AT HIM!", "GIMME A MINUTE! I'M AVERTING MY EYES!", 'TIMEOUT! AND GET HIM A TOWEL!'],
};

// ---- The fight

/** Swooping down at him to grab him. */
export const DONNIE_DIVE: ByPants = {
  clean: ['WATCH THIS! THIS IS THE COOL PART!', 'COME TO DONNIE!', 'SWOOP! I SAID SWOOP!'],
  shitty: ['HOLDING MY BREATH! HERE I COME!', 'COME TO DONNIE! SHOULDERS ONLY!', 'SWOOP! AND STRAIGHT BACK UP!'],
  nude: ['COME TO DONNIE! NOT ALL OF YOU!', 'SWOOPING WITH MY EYES CLOSED!', 'NECK! NECK! ONLY THE NECK!'],
};
/** Got him: draining. */
export const DONNIE_DRAIN: ByPants = {
  clean: ['OH YEAH! I FEEL TWENTY-FIVE!', 'YOU TASTE LIKE PROTEIN POWDER!', 'BETTER THAN THE BUFFET!'],
  shitty: ["DON'T SQUIRM! IT SQUISHES WHEN YOU SQUIRM!", "BLOOD'S BLOOD! DON'T THINK ABOUT IT!", 'I FEEL YOUNG! I FEEL SICK!'],
  nude: ["DON'T PRESS AGAINST ME! I SAID DON'T PRESS!", 'JUST THE NECK! THE NECK IS FINE!', "SOMETHING'S ON MY LEG! KEEP DRINKING, DONNIE!"],
};
/** He got loose. */
export const DONNIE_ESCAPED: ByPants = {
  clean: ["HEY! I WASN'T DONE!", 'NO WIGGLING! IT WAS GOING SO GOOD!', 'FINE! I GOT PLENTY MORE SWOOPS!'],
  shitty: ['GOOD! GO! I NEEDED AIR!', 'NO WIGGLING! IT GETS ON ME!', 'FINE! I NEED A WET WIPE ANYWAY!'],
  nude: ['HEY! YOU WERE TOUCHING ME!', 'NO WIGGLING! EVERYTHING WIGGLES!', 'FINE! I NEED A MINUTE!'],
};
/** Meathead grabs him: he squirts right out of it, the greasy fatass. */
export const DONNIE_GREASED: ByPants = {
  clean: ["NOBODY HOLDS DONNIE! I'M BASTED!", "THAT'S BACK SWEAT AND HAIR GREASE, PAL! TOP SHELF!", "YOU CAN'T GET YOUR ARMS AROUND ALL THIS! NOBODY CAN!"],
  shitty: ['GET YOUR SHITTY HANDS OFF ME! ...OH, THEY SLID OFF!', "GREASE BEATS SHIT, PAL! I'M LIKE A NONSTICK PAN!", "DON'T WIPE YOUR HANDS ON MY CAPE!"],
  nude: ['A NAKED GUY HUGGED ME! THANK GOD I SWEAT GREASE!', 'NO NAKED WRESTLING! I SLIDE RIGHT OUT!', "HANDS OFF! AND KEEP THAT OTHER THING OFF TOO!"],
};
/** After every drink (him, or a guest): the burp (a sound), then this. */
export const DONNIE_GORGE: ByPants = {
  clean: ['SECONDS.', "I'M STILL HUNGRY.", 'ONE MORE BITE.', "DON'T JUDGE ME.", 'ROOM FOR DESSERT.', 'PASS THE NAPKINS.'],
  shitty: ['SECONDS. EVEN WITH THE STINK.', "I'M STILL HUNGRY. NOT FOR YOU.", 'ONE MORE BITE. FAR FROM THE PANTS.', "DON'T JUDGE ME. YOU SHIT YOURSELF.", 'ROOM FOR DESSERT. NOT BROWNIES.', 'PASS THE NAPKINS. AND A CLOTHESPIN.'],
  nude: ['SECONDS. NO PEEKING.', "I'M STILL HUNGRY. PUT THE SAUSAGE AWAY.", 'ONE MORE BITE. NECK ONLY.', "DON'T JUDGE ME. YOU'RE NAKED.", 'ROOM FOR DESSERT. NOT THAT COCKTAIL WIENER.', 'PASS THE NAPKINS. COVER THAT.'],
};
/** A guest comes near while he's at Meathead (the tell, the swoop, the spew, got hold of him): he can't help himself. */
export const DONNIE_TEMPTED: ByPants = {
  clean: ['OOH! HOLD THAT THOUGHT!', 'WAIT! THAT ONE LOOKS JUICY!', "BE RIGHT BACK! DON'T MOVE!"],
  shitty: ["HOLD THAT THOUGHT! THAT ONE DOESN'T STINK!", 'WAIT! A CLEAN ONE!', "BE RIGHT BACK! GO WASH!"],
  nude: ['HOLD THAT THOUGHT! THAT ONE HAS PANTS!', 'WAIT! A DRESSED ONE!', 'BE RIGHT BACK! FIND A TOWEL!'],
};
/** A guest running past: lunch. */
export const DONNIE_SNATCH: ByPants = {
  clean: ['OOH! TAKEOUT!', 'WATCH THIS! DRIVE-THRU!', "SORRY, PAL! I'M ON A ROLL!"],
  shitty: ["OOH! TAKEOUT! THAT DOESN'T STINK!", 'YOU SMELL NORMAL! COME HERE!', 'THIS ONE BATHED!'],
  nude: ['OOH! TAKEOUT! WITH PANTS!', 'YOU HAVE PANTS! YOU ARE MY FAVORITE!', 'DRESSED PEOPLE TASTE BETTER!'],
};
/** And it all back out of him at Meathead. */
export const DONNIE_SPEW: ByPants = {
  clean: ['BLOOD CANNON!', 'SAY HELLO TO MY LITTLE... BLOOD!', 'I GOT EXTRA! HAVE SOME!'],
  shitty: ['BLOOD CANNON! SOMEBODY HAS TO HOSE YOU DOWN!', 'PRESSURE WASH! YOU NEED IT!', 'I GOT EXTRA! RINSE OFF!'],
  nude: ['BLOOD CANNON! AT LEAST IT COVERS YOU!', "SAY HELLO TO MY LITTLE... DON'T SAY LITTLE!", 'I GOT EXTRA! HERE! WEAR IT!'],
};
/** Hit (a little: most things barely scratch him now). */
export const DONNIE_HURT: ByPants = {
  clean: ['HA! TICKLES!', 'OW! I MEAN... HA! IMMORTAL!', 'THAT WOULD HAVE HURT YESTERDAY!', "WATCH THE CAPE! IT'S A RENTAL!"],
  shitty: ["HA! TICKLES! DON'T TOUCH ME WITH IT!", 'OW! I MEAN... HA! IMMORTAL! AND UPWIND!', "THE HIT DIDN'T HURT! THE SMELL HURT!", 'WATCH THE CAPE! IT ABSORBS ODORS!'],
  nude: ['HA! TICKLES! STOP JUMPING! IT ALL BOUNCES!', 'OW! I MEAN... HA! IMMORTAL! STOP FLEXING!', 'I GOT WINGS! YOU GOT NO PANTS!', "WATCH THE CAPE! IT'S THE ONLY CLOTHES IN THE ROOM!"],
};
/** The Christ the Redeemer souvenir: it burns. */
export const DONNIE_REDEEMER: ByPants = {
  clean: ['AAAGH! IT BURNS!', 'NOT THE LITTLE JESUS!', 'WHY DO YOU HAVE A JESUS?!'],
  shitty: ['AAAGH! IT BURNS! IT SMELLS LIKE YOUR BAG!', 'NOT THE LITTLE JESUS! WHERE HAS HE BEEN?!', 'HE LOOKS SO DISAPPOINTED IN ME!'],
  nude: ['AAAGH! WHERE WERE YOU CARRYING THAT?!', 'NOT THE LITTLE JESUS! HE CAN SEE YOU!', 'HIS ARMS ARE OUT! HE WANTS YOU TO PUT PANTS ON!'],
};
/** In between: showing off. */
export const DONNIE_TAUNT: ByPants = {
  clean: [
    "LOOK AT ME! THIS MORNING I WAS ASSISTANT MANAGER! NOW I'M BAT GOD!",
    'I PAID TWO HUNDRED BUCKS FOR A ZIPLINE IN CANCUN! NOW I FLY FOR FREE!',
    "I'M PUTTING THIS ON MY RESUME! UNDER SKILLS!",
    'WAIT TILL MY EX SEES THIS! SHE TOOK THE BOAT! I GOT WINGS!',
  ],
  shitty: [
    "THIS MORNING I WAS ASSISTANT MANAGER! NOW I'M BAT GOD! YOU'RE STILL A GUY WHO SHIT HIMSELF!",
    "THE AIR'S SO MUCH CLEANER UP HERE!",
    "I'M PUTTING THIS ON MY RESUME! 'KILLED A MAN WHO SHIT HIMSELF!'",
    "WAIT TILL MY EX SEES THIS! I'M FLYING OVER A GUY WHO SHIT HIMSELF!",
  ],
  nude: [
    "THIS MORNING I WAS ASSISTANT MANAGER! NOW I'M BAT GOD! YOU'RE JUST A NAKED GUY!",
    "I'M FLYING! WHICH MEANS I'M LOOKING DOWN! I REGRET IT!",
    "I'M PUTTING THIS ON MY RESUME! I'M LEAVING OUT YOUR DICK!",
    "WAIT TILL MY EX SEES THIS! ACTUALLY, DON'T TELL HER ABOUT YOU!",
  ],
};
/** The fight's first moment: the power's in him, and he's in love with it. */
export const DONNIE_ENAMORED: ByPants = {
  clean: ["REAL FANGS! KEEP THE SOUL, BIG GUY! I'M HERE FOR THE BUFFET!", 'YOU GET A SOUL! I GET A SNACK!', 'REAL FANGS! SUCK IT, DENTAL PLAN! WHO WANTS TO BE DINNER?'],
  shitty: ["REAL FANGS! KEEP THE SOUL! I WANT A SNACK! NOT HIM!", 'YOU GET A SOUL! I GET A SNACK! A DIFFERENT SNACK!', "REAL FANGS! AND I DON'T EVEN HAVE TO GET CLOSE!"],
  nude: ["REAL FANGS! KEEP THE SOUL! I'M HERE FOR THE BUFFET!", 'YOU GET A SOUL! I GET A SNACK! WITH PANTS ON!', "REAL FANGS! YOU GET THE SOUL! I GET THE NECK! ONLY THE NECK!"],
};
/** A retry (the intro seen): back up and waiting, a quick loop and a taunt before he's after him. */
export const DONNIE_ENTRANCE: ByPants = {
  clean: ["BACK FOR SECONDS? I'M STILL THIRSTY!", 'YOU AGAIN! I JUST GOT YOU OUT OF MY TEETH!', 'LOOK AT ME! STILL GORGEOUS! STILL FLYING!', 'ROUND TWO! I WAXED MY WINGS FOR THIS!'],
  shitty: ['YOU CAME BACK! STILL SMELL LIKE A CRYPT TOILET!', "I'LL DRINK FROM THE NECK! FAR FROM THE PANTS!", "STILL SHITTY? I'LL USE A STRAW!"],
  nude: ["STILL NAKED! I'M LOOKING AT THE CEILING!", "YOU CAME BACK NUDE? YOU CAN'T HAVE MY CAPE!", 'ROUND TWO! PUT SOMETHING ON! ANYTHING!'],
};
/** Satan, now and then, at Donnie: the soul, Donald. */
export const SATAN_NAG: ByPants = {
  clean: ['THE SOUL, DONALD. STOP POSING.', 'I DID NOT GIVE YOU WINGS TO SHOW OFF, DONALD.', 'DONALD. THE SOUL. NOT THE BUFFET.'],
  shitty: ['THE SOUL, DONALD. YES, I SMELL IT TOO. DRAIN HIM.', 'STOP HOLDING YOUR NOSE AND DRAIN HIM, DONALD.', 'DONALD. YOU WORK IN A THEME PARK. YOU HAVE SMELLED WORSE.'],
  nude: ['THE SOUL, DONALD. STOP LOOKING AWAY.', 'YOU ARE BOTH SHOWING OFF, DONALD. IT IS UNBEARABLE.', 'DONALD. EYES ON THE NECK.'],
};
/** Beaten (the usual way): the powers out, and everything he's drunk catches up with him; he swells up, keels over and
 *  shits himself. */
export const DONNIE_DIES: ByPants = {
  clean: ['TOO... MUCH... BLOOD...', "I SHOULDN'T HAVE HAD... THAT LAST GUY...", 'TELL MY MOTHER... I CLEANED MY PLATE...'],
  shitty: ['TOO MUCH BLOOD... AND IT ALL TASTED LIKE YOUR ASS...', "I SHOULDN'T HAVE... EATEN... NEAR YOU...", 'TELL MY MOTHER... I CLEANED MY PLATE... BURN THE PLATE...'],
  nude: ['TOO MUCH BLOOD... AND A DICK... WITH MY MOUTH FULL...', "I SHOULDN'T HAVE... EATEN... NEAR THAT...", 'TELL MY MOTHER... I CLEANED MY PLATE... AND I SAW A DICK...'],
};
/** Beaten by the little statue: he burns up. */
export const DONNIE_BURNS: ByPants = {
  clean: ['NOT BY A TWO DOLLAR JESUS!', "I'M SMOKING! I QUIT IN NINETY-EIGHT!", 'OKAY! I BELIEVE! I BELIEVE! AAAAGH!'],
  shitty: ['NOT LIKE THIS! NOT BY A GUY WHO SHIT HIMSELF!', "I'M BURNING! AT LEAST I CAN'T SMELL YOU!", 'OKAY! I BELIEVE! I BELIEVE YOU NEED A SHOWER! AAAAGH!'],
  nude: ['NOT LIKE THIS! NOT BY A NAKED MAN!', "I'M BURNING! AND THE LAST THING I SEE IS... AAAAGH!", 'OKAY! I BELIEVE! I BELIEVE IN PANTS! AAAAGH!'],
};
/** Satan, taking what's left of him. */
export const SATAN_CLAIM: ByPants = {
  clean: ['YOUR SOUL WILL DO FOR NOW, DONALD. ...ANOTHER DAY, MEATHEAD.', 'COME, DONALD. YOUR PAPERWORK IS WAITING.', 'POOR DONALD. ...I WILL BE SEEING YOU, MEATHEAD.'],
  shitty: ['YOUR SOUL WILL DO FOR NOW, DONALD. ...MEATHEAD. BATHE BEFORE YOU COME TO ME.', 'COME, DONALD. WE WILL BURN THE CAPE.', 'POOR DONALD. ...I WILL BE SEEING YOU, MEATHEAD. FROM A DISTANCE.'],
  nude: ['YOUR SOUL WILL DO FOR NOW, DONALD. ...MEATHEAD. WE HAVE ROBES IN HELL.', 'COME, DONALD. AT LEAST YOU DIED DRESSED.', 'POOR DONALD. ...I WILL BE SEEING YOU, MEATHEAD. ALL OF YOU, APPARENTLY.'],
};
/** Meathead, when a souvenir out of the launcher bounces off Donnie without much to show for it: something in that
 *  bag has to work on a vampire (it's the little Christ the Redeemer; he doesn't say so). */
/** Meathead, Donnie drinking a guest (healing off them), till he's knocked one loose with a charge: the hint. */
/** A grab at Donnie: too much of a greasy fatass to hold on to. */
export const MEATHEAD_GREASE = [
  "HE'S TOO FAT TO GET MY ARMS AROUND!", 'GREASY FAT BASTARD!', 'LIKE HUGGING A BUTTERED HAM!', 'WHAT DOES HE SWEAT, GRAVY?!',
  'ALL FLAB AND GREASE! NO HANDLES!',
];
export const MEATHEAD_CHARGE_HINT = [
  "HE'S HEALING OFF THAT GUY. RAM HIM!",
  'GET OFF HIM, YOU LEECH! I SHOULD TACKLE YOU OFF!',
  "HE'S DRINKING HIS HEALTH BACK. KNOCK HIM OFF THAT GUY!",
  'A RUNNING HIT. THAT GETS A FAT BAT OFF A NECK.',
];
export const MEATHEAD_SOUVENIR_HINT = [
  "THERE'S GOTTA BE SOMETHING IN THIS BAG THAT WORKS ON A VAMPIRE.",
  'HE SHRUGGED THAT OFF. WHAT DO VAMPIRES HATE?',
  'COME ON, BAG. GIVE ME SOMETHING HOLY.',
  'I NEED SOMETHING CHURCHY. WHAT ELSE IS IN HERE?',
];
/** Meathead, after. */
export const MEATHEAD_WON = ["SHOULD'VE SKIPPED DESSERT.", 'THE COUNT IS DOWN. AND OUT.', "SHOULD'VE KEPT BEGGING."];
/** ...after the little statue did it. */
export const MEATHEAD_WON_WEAK = ['NEVER LEAVE HOME WITHOUT A SOUVENIR.', 'HE REALLY HATED THAT LITTLE JESUS.', 'ASHES TO ASHES. DORK TO DUST.'];

// ---- The guests running through (screaming) (park guests: 'm2.guest', 'm2.guest2')
export const GUEST_SCREAM = ["HE'S GOT REAL FANGS!", 'I JUST CAME FOR THE BUFFET!', "THIS ISN'T IN THE BROCHURE!", 'WHY IS THAT GUY FLYING?!', 'I WANT A REFUND!'];

// ---- What he says when each of Donnie's things hurts him, and the death screen

export const HURT_DRAIN = ["HE'S SUCKING ME DRY!", 'GET YOUR TEETH OUT OF MY NECK!', "THAT'S MY BLOOD, YOU LEECH!"];
export const DEATH_DRAIN = ['DRAINED', 'SUCKED DRY', 'JUICE BOX'];
export const HURT_BLOOD = ["HE SPIT SOMEBODY ELSE'S BLOOD AT ME!", "IT'S IN MY MOUTH!", "BLOOD MACHINE GUN! THAT'S NOT A THING!"];
export const DEATH_BLOOD = ['HOSED DOWN', 'DROWNED IN SECONDHAND BLOOD', 'SPRAYED'];

export const VOICE_LINES: Record<string, string[]> = {
  meathead: [...MEATHEAD_WON, ...MEATHEAD_WON_WEAK, ...MEATHEAD_SOUVENIR_HINT, ...MEATHEAD_CHARGE_HINT, ...MEATHEAD_GREASE, ...HURT_DRAIN, ...HURT_BLOOD],
  death: [...DEATH_DRAIN, ...DEATH_BLOOD],
  'm2.donnie': [
    ...[DONNIE_PLEAD, DONNIE_ENAMORED, DONNIE_ENTRANCE, DONNIE_SHOWOFF, DONNIE_SATAN_PANIC, DONNIE_GUEST, DONNIE_STUN, DONNIE_LOW, DONNIE_DIVE, DONNIE_DRAIN, DONNIE_ESCAPED, DONNIE_GREASED, DONNIE_SNATCH, DONNIE_SPEW, DONNIE_HURT, DONNIE_REDEEMER, DONNIE_TAUNT, DONNIE_DIES, DONNIE_BURNS, DONNIE_GORGE, DONNIE_TEMPTED].flatMap(all),
  ],
  'm2.satan': [...[SATAN_GRANT, SATAN_SOUL, SATAN_NAG, SATAN_GUEST, SATAN_STUN, SATAN_LOW, SATAN_CLAIM].flatMap(all)],
  'm2.guest': [...GUEST_SCREAM],
  'm2.guest2': [...GUEST_SCREAM],
};
