// The water park, level 1: what's said (ALL CAPS, American spelling; clean / shitty / naked where it's his or about
// him). Every line here is in PARK1_VOICE_LINES (endgame/lines.ts folds it into ENDGAME_VOICE_LINES, recorded by
// npm run voices).

export interface ByPants { clean: string[]; shitty: string[]; nude: string[] }
const bp = (clean: string[], shitty: string[], nude: string[]): ByPants => ({ clean, shitty, nude });

/** The voices: the kid (Zorblax and Zarblax's), the possessed (demon-possessed: the doom; alien-possessed: Zorblax's
 *  people's own voices out of a person's mouth). */
export const KID_VOICE = 'm2.wp.kid';
export const DPOS_VOICE = { m: 'm2.wp.possessed', f: 'm2.wp.possessedf' };
export const APOS_VOICE = { m: 'm2.space.alien', f: 'm2.space.alienf' };

// ---------------------------------------------------------------------------------------------------------------
// Meathead, going

/** Kicking the gate down (the lot). */
export const MH_KICK = bp(['CLOSED MY ASS.'], ['CLOSED MY SHITTY ASS.'], ['CLOSED MY BARE ASS.']);
/** In through it. */
export const MH_IN = bp(
  ["A WATER PARK AT MIDNIGHT. ALL MINE.", "NOBODY IN LINE. FIRST TIME IN MY LIFE."],
  ["A WATER PARK. I'M RINSING OFF IN EVERY POOL.", "NOBODY IN LINE. GOOD. NOBODY SMELLS ME."],
  ["A WATER PARK. FINALLY, I'M DRESSED FOR SOMETHING.", "NOBODY HERE. NOBODY SEES MY DICK."],
);
/** The first of the possessed. */
export const MH_POSSESSED = bp(
  ["THAT GUY'S EYES ARE GLOWING. NOT A GOOD SIGN.", "THEY'RE POSSESSED. GREAT. THE TOURISTS ARE POSSESSED."],
  ["POSSESSED TOURISTS. AND I SHIT MYSELF. BIG NIGHT.", "GLOWING EYES. SHIT. MORE SHIT."],
  ["POSSESSED TOURISTS. AND I'M NAKED. GREAT COMBO.", "GLOWING EYES. DON'T LOOK DOWN, BUDDY."],
);
/** First down a slide. */
export const MH_SLIDE = bp(["WHEEE. I MEAN. FUCK YEAH."], ["WHEEE. IT'S IN MY SOCKS."], ["WHEEE. THAT'S COLD ON THE BALLS."]);
/** The first crater the slide's for. */
export const MH_CRATER = bp(
  ["A CRATER. THE SLIDE'S THE ONLY WAY OVER. DUMB. I LOVE IT."],
  ["A CRATER. I'M NOT FALLING IN THAT WITH SHIT PANTS."],
  ["A CRATER. NOT FALLING IN THAT NAKED."],
);
/** The pelicans. */
export const MH_PELICAN = bp(["EVEN THE BIRDS ARE POSSESSED. FLORIDA."], ["EVEN THE BIRDS. THEY SMELL ME."], ["EVEN THE BIRDS. DON'T PECK THAT."]);
/** Taking a tube. */
export const MH_TUBE = bp(
  ["A TUBE. IT'S STUCK TO MY ASS. GOOD.", "THE SLIDE'S GOT HOLES IN IT. GREAT. JUMP THE HOLES."],
  ["A TUBE. MY SHITTY ASS IN A TUBE.", "IT'S STUCK ON. THE SHIT'S HOLDING IT."],
  ["A TUBE. MY BARE ASS IS STUCK TO IT.", "IT'S SUCTIONED ON. IT'S NOT COMING OFF. NEITHER AM I."],
);
/** The ride's last alien down: the loop lets him go. */
export const MH_TUBE_CLEAR = bp(["THAT'S ALL OF THEM. NOW LET ME OFF."], ["ALL DEAD. NOW LET ME OFF THIS THING."], ["ALL DEAD. LET ME OFF. MY ASS IS RAW."]);
/** Off the end of a tube ride into its pool. */
export const MH_TUBE_DONE = bp(["AGAIN. NO. NEVER AGAIN."], ["THE POOL GOT SOME OF IT OFF."], ["THAT POOL'S HAD WORSE IN IT."]);
/** MOUNT EVEREST BUT BETTER, in sight. */
export const MH_EVEREST = bp(
  ["MOUNT EVEREST BUT BETTER. IN FLORIDA. AT SEA LEVEL.", "FAKE SNOW. IT'S EIGHTY DEGREES. THIS IS STUPID."],
  ["MOUNT EVEREST. I'M CLIMBING IT IN SHIT PANTS.", "FAKE SNOW. REAL SHIT."],
  ["MOUNT EVEREST. NAKED. LIKE A REAL EXPLORER.", "FAKE SNOW. MY NIPPLES BELIEVE IT."],
);
/** Locked in on a floor. */
export const MH_LOCKED = bp(["LOCKED IN. FINE.", "THEY WANT ME TO EARN THE STAIRS."], ["LOCKED IN WITH MY OWN SMELL."], ["LOCKED IN. NAKED. WITH THEM."]);
/** A floor clear: the stairs open. */
export const MH_FLOOR_DONE = bp(["NEXT FLOOR.", "UP WE GO.", "HOW MANY FUCKING FLOORS."], ["NEXT FLOOR. SQUISH.", "UP. IT'S RUNNING DOWN."], ["NEXT FLOOR. IT'S DRAFTY.", "UP. THE WIND'S GETTING IN."]);
/** At the summit's door. */
export const MH_SUMMIT = bp(
  ["THE SUMMIT. SOMETHING UP THERE SMELLS LIKE ZORBLAX."],
  ["THE SUMMIT. SOMETHING UP THERE SMELLS WORSE THAN ME."],
  ["THE SUMMIT. A THOUSAND FEET UP AND NAKED."],
);
/** The hint the level 2 way's shut (the stub's end). */
export const MH_STUB = bp(["THE WAVE POOL'S SHUT. FOR NOW."], ["SHUT. I'LL WAIT. I'LL STINK."], ["SHUT. I'LL WAIT. NAKED."]);

// ---------------------------------------------------------------------------------------------------------------
// The possessed: a bark now and then as one comes at him (demon-possessed: the doom; alien-possessed: Zorblax's
// people's voices out of a tourist's mouth)

export const DPOS_BARK = bp(
  ['YOUR SOUL! IT IS OWED!', 'THE BOSS WANTS YOU DOWN!', 'I HAD A FAST PASS! NOW I HAVE HIM!'],
  ['YOUR SOUL REEKS! HE WANTS IT ANYWAY!', 'EVEN HELL SMELLS YOU!'],
  ['YOUR SOUL! AND YOUR DICK! BOTH OURS!', 'COVER IT, SINNER!'],
);
export const APOS_BARK = bp(
  ['YOU KILLED OUR QUEEN!', 'INTO THE JAR WITH YOU!', 'THIS BODY HAS A SUNBURN! IT HURTS!'],
  ['YOU LEAK! WE WILL STUDY IT!', 'THE SMELL! EVEN THIS BODY GAGS!'],
  ['THE NAKED ONE! SAMPLE HIM!', 'PROBE THE NAKED ONE!'],
);

// ---------------------------------------------------------------------------------------------------------------
// Hurt and death (his hurt callouts, the death screen's one line: 28 characters at most)

export const HURT: Record<string, { hurt: string[]; death: string[] }> = {
  'm2:wp_dguest': { hurt: ['A TOURIST BIT ME! A HELL TOURIST!', 'GET YOUR FAST PASS OUT OF MY FACE!', 'YOUR BREATH SMELLS LIKE SULFUR AND NACHOS!'], death: ['BEATEN BY A HELL TOURIST', 'POSSESSED DAD STRENGTH'] },
  'm2:wp_aguest': { hurt: ['A SUNBURNED ALIEN PUPPET HIT ME!', 'GET OUT OF THAT GUY AND FIGHT ME!', 'YOUR EYES ARE GREEN, YOUR FIST IS HARD!'], death: ['BEATEN BY AN ALIEN PUPPET', 'PROBED BY A TOURIST'] },
  'm2:wp_gator': { hurt: ['A GATOR! IN THE WATER PARK! FLORIDA!', 'IT BIT MY ANKLE! A DEMON ANKLE BITER!', 'GET OFF ME, YOU HANDBAG!'], death: ['EATEN BY A GATOR. FLORIDA.', 'A HANDBAG ATE ME'] },
  'm2:wp_pelican': { hurt: ['THE PELICAN! IT GOT MY HEAD!', 'FUCK OFF, BEAK BAG!', 'A BIRD! A FLORIDA BIRD!'], death: ['DIVE BOMBED BY A PELICAN', 'IN THE POUCH'] },
  'm2:wp_trooper': { hurt: ['A REAL ALIEN! WITH A REAL GUN!', 'MY ASS! YOU SHOT MY ASS!', 'STOP AIMING AT ME!'], death: ['SHOT BY A TROOPER', 'ZORBLAX SENDS HIS BEST'] },
  'm2:wp_bolt': { hurt: ['RAY GUN! THEY GOT RAY GUNS!', 'THAT BURNED! IT SMELLS LIKE MY HAIR!', 'PEW PEW, YOU FUCK!'], death: ['RAYED DEAD', 'SHOT IN THE WATER PARK'] },
  'm2:wp_hover': { hurt: ['A FLYING ONE! GET DOWN HERE!', 'YOUR FRISBEE HIT ME!', 'GET OFF YOUR DINNER PLATE!'], death: ['RUN DOWN BY A SAUCER GUY', 'KILLED BY A DINNER PLATE'] },
  'm2:wp_yeti': { hurt: ['THE YETI! THE MASCOT! IT PUNCHED ME!', "THERE'S A DEMON IN THE MASCOT!", 'YOUR COSTUME SMELLS LIKE A FOOT!'], death: ['BEATEN BY A YETI MASCOT', 'THE MASCOT WON'] },
  'm2:wp_pipe': { hurt: ['MY HEAD! A PIPE! DUCK, IDIOT!', 'THE PIPE! RIGHT IN THE FACE!', 'LOW CLEARANCE! LOW!'], death: ['HEAD MEETS PIPE', 'SHOULD HAVE DUCKED'] },
  'm2:wp_kid': { hurt: ['HE WALKED RIGHT INTO ME!', 'GET YOUR GUT OUT OF MY FACE!', "IT'S WARM! THE GUT IS WARM!"], death: ['TRAMPLED BY THE KID', 'RUN OVER BY A GUT'] },
  'm2:wp_kidshot': { hurt: ['THE KID SHOOTS TOO! GREAT!', 'WHICH ARM DID THAT COME OUT OF?!', 'THE KID GOT ME!'], death: ['SHOT BY THE KID', 'THE THIRD ARM GOT ME'] },
  'm2:wp_kidslam': { hurt: ['HE SLAMMED ME INTO THE FLOOR!', 'BOTH FISTS! RIGHT ON MY HEAD!', 'GET YOUR KNUCKLES OFF ME!'], death: ['FLATTENED BY THE KID', 'HAMMERED INTO THE SUMMIT'] },
  'm2:wp_kidsweep': { hurt: ['HIS ARM GOES ON FOREVER!', 'SWATTED LIKE A FLY!', 'THAT ARM HAS A RASH ON IT!'], death: ['SWATTED BY THE KID', 'CLOTHESLINED BY A MUTANT'] },
  'm2:wp_kidwhip': { hurt: ['HIS ARM STRETCHES?!', 'WHIPPED BY A FOREARM!', 'THAT IS NOT HOW ARMS WORK!'], death: ['WHIPPED BY A FOREARM', 'LASHED BY THE KID'] },
  'm2:wp_kidgrab': { hurt: ["HE'S SQUEEZING MY GUTS OUT!", 'TOO TIGHT! TOO MOIST!', 'NOT THE HUG! NOT THE HUG!'], death: ['HUGGED TO DEATH', 'SQUEEZED LIKE A ZIT'] },
  'm2:wp_kidpuke': { hurt: ['HE PUKED ON ME!', "IT'S HOT! WHY IS IT HOT?!", "THERE'S CORN IN IT! ALIEN CORN!"], death: ['DROWNED IN KID PUKE', 'BARFED TO DEATH'] },
  'm2:wp_kidquake': { hurt: ['HE STOMPED THE FLOOR!', 'MY ANKLES!', 'QUIT STOMPING, YOU TODDLER!'], death: ['STOMPED BY THE KID', 'A TANTRUM GOT ME'] },
};
/** Down a gap in the chute, tube and all (a missed jump), as he goes down into the dark. */
export const MH_FALL = ['NO NO NO NO!', "THERE'S NO BOTTOM!", "WHERE'S THE REST OF THE SLIDE?!"];
/** The death screen's line for the drop (the stage says: layout.deathMessage). */
export const TUBE_DEATH = ['MISSED THE JUMP', 'THE SLIDE HAD A HOLE IN IT', 'NO BOTTOM'];

// ---------------------------------------------------------------------------------------------------------------
// The summit: Zorblax and Zarblax's kid (grown, a young adult: their son, mutated). Talks like a young adult who never
// left home: bored, blunt, mean, whiny, mom this and dad that.

export const KID_NAME = 'ZORZARBLAX';
/** The intro: on the summit, the kid with the view. */
// (the owner's, 2026-11-11: every endgame boss is a child of Satan or the alien widow, and the lines let the player
// know: he's the widow's son (MOM, widowed by Meathead), GUPPLAX (level 3's) his big brother)
export const KID_INTRO = bp(
  ["YOU KILLED MY DAD. HE WAS MY UNCLE TOO. MOM'S A WIDOW NOW."],
  ["YOU KILLED MY DAD. WITH YOUR ASS, BY THE SMELL. MOM'S A WIDOW NOW."],
  ["YOU KILLED MY DAD. NAKED? MOM'S A WIDOW AND YOU'RE NAKED."],
);
export const MH_INTRO = bp(["WHAT THE FUCK ARE YOU?"], ["WHAT THE FUCK IS THAT. AND I SAY THAT SMELLING LIKE THIS."], ["WHAT THE FUCK. AND I'M THE ONE WITH MY DICK OUT."]);
export const KID_INTRO2 = bp(
  ["MOM SAYS KILL YOU AND I GET MY OWN POD. BEFORE MY BIG BROTHER GUPPLAX DOES."],
  ["MOM SAYS KILL YOU AND I GET MY OWN POD. MY BIG BROTHER GUPPLAX GETS THE SMELL."],
  ["MOM SAYS KILL YOU AND I GET MY OWN POD. MY BIG BROTHER GUPPLAX CAN'T SEE THIS."],
);
/** Taunts mid-fight. */
export const KID_TAUNT = bp(
  ["I HAVE THREE ARMS. YOU HAVE TWO. DO THE MATH.", "MY EYES DON'T AGREE WHERE YOU ARE. ALL OF THEM ARE RIGHT.", "DAD WAS MY DAD AND MY UNCLE. CHRISTMAS WAS CHEAP.", "GUPPLAX IS MOM'S FAVORITE. SHE SENT ME FIRST."],
  ["YOU SMELL LIKE MY ROOM.", "MOM'S GONNA MAKE ME HOSE OFF THE SUMMIT.", "I CAN SMELL YOU WITH ALL MY NOSES.", "YOU SMELL LIKE MY BROTHER GUPPLAX'S TANK."],
  ["PUT IT AWAY, MAN.", "I'M NOT LOOKING AT IT. TWO OF MY EYES ARE.", "MOM WARNED ME ABOUT NAKED HUMANS. SHE WAS RIGHT.", "MY BROTHER GUPPLAX SWIMS NAKED TOO. I HATE IT."],
);
/** Hurt. */
export const KID_HURT = bp(
  ['OW! MOM!', "THAT'S MY GOOD ARM!", 'OW, MY EXTRA KNEE!'],
  ['OW! YOU GOT SHIT ON ME!', 'GROSS! OW!'],
  ['OW! YOUR THING TOUCHED ME!', 'OW! COVER IT!'],
);
/** Its tantrum (low health). */
export const KID_LOW = bp(
  ["I'M TELLING MOM!", "THIS ISN'T FAIR! NOTHING'S EVER FAIR!", "GUPPLAX! HELP! HE NEVER HELPS!"],
  ["I'M TELLING MOM YOU'RE GROSS!", "GUPPLAX! HE STINKS! HELP!"],
  ["I'M TELLING MOM YOU WERE NAKED!", "GUPPLAX! HE'S NAKED! HELP!"],
);
/** Its standard death: a last line, slumped in the slide's mouth. */
export const KID_DEATH = bp(
  ["TELL MOM... I CLEANED MY POD.", "TELL GUPPLAX... HE CAN HAVE MY POD."],
  ["TELL MOM... YOU SMELLED.", "TELL GUPPLAX... BRING A HOSE."],
  ["TELL MOM... I DIDN'T LOOK.", "TELL GUPPLAX... DON'T LOOK AT IT."],
);
/** Meathead, killing it: riding the kid down the slide. */
export const MH_RIDE = bp(["HOP IN, KID. LET'S GO HOME."], ["MOVE OVER, KID. YOUR BODY'S MY TUBE."], ["SCOOCH, KID. NAKED BOBSLED."]);
/** Grabbing him (too big). */
export const GRAB_KID = ["HE'S HUGE. AND MOIST.", "TOO BIG. TOO SLIMY. TOO MANY ARMS.", "I'M NOT TOUCHING THAT."];
/** His misery (the owner's "obvious intense discomfort"): stopped mid-walk to whine. */
export const KID_WHINE = bp(
  ['OW. MY EVERYTHING HURTS.', "MOM. IT'S DOING THE THING AGAIN.", 'MY BACK HAS A BACK. IT HURTS TOO.', "I'M NOT CRYING. MY EYES LEAK. ALL THREE.", 'WHY DOES MY BLOOD ITCH.', "MY SHORT LEG'S ASLEEP. IT'S ALWAYS ASLEEP.", 'I NEED MY CREAM. THE PINK ONE.', 'EVERY STEP IS A NEW KIND OF OW.'],
  ['YOU SMELL AND I HURT. WORST DAY EVER.', 'THE SMELL IS GETTING IN MY BOILS.', "I'M GONNA PUKE AND IT'S YOUR FAULT.", 'MOM. THE MAN SMELLS LIKE THE POD TOILET.', "MY EYES ARE WATERING. ALL THREE. IT'S YOU.", 'IT HURTS TO BREATHE. YOU MADE IT WORSE.'],
  ["STOP LOOKING AT MY RASH. I'M NOT LOOKING AT YOURS.", "YOU'RE NAKED AND I'M THE ONE WHO'S RAW.", "PUT IT AWAY. I'M HAVING A HARD ENOUGH DAY.", 'MOM. THE NAKED MAN. MY BOILS ARE SCARED.', 'EVEN YOUR BALLS LOOK HEALTHIER THAN ME.', "I CHAFE. YOU DON'T EVEN CHAFE. UNFAIR."],
);
/** Scratching the rash raw. */
export const KID_SCRATCH = bp(
  ['IT ITCHES. IT ALWAYS ITCHES.', 'MOM PUT CREAM ON IT. IT ATE THE CREAM.', "DON'T LOOK. IT'S SPREADING.", "I SCRATCHED THROUGH. THERE'S MORE ME UNDER."],
  ['I ITCH AND YOU STINK. WE BOTH LOSE.', 'SCRATCHING MAKES IT WORSE. SO DOES YOUR SMELL.', "IT'S WEEPING. SO AM I. SO ARE YOUR PANTS."],
  ["I'M SCRATCHING. YOU'RE SWINGING. WE'RE BOTH GROSS.", "DON'T WATCH ME SCRATCH. I DON'T WATCH YOUR DICK.", "IT ITCHES WORSE WHEN YOU'RE NAKED AT IT."],
);
/** A boil, popped. */
export const KID_BOIL = bp(
  ['OH GOD. THAT ONE WAS RIPE.', 'IT POPPED. I NAMED IT KEVIN.', 'IT WENT IN MY TOP EYE.', 'THAT WAS THE ONE MOM SAID LEAVE ALONE.'],
  ['NOW WE BOTH LEAK.', "THAT'S MY PUS. THAT'S YOUR SHIT. GROSS.", 'IT POPPED. IT SMELLS BETTER THAN YOU.'],
  ['IT GOT ON YOUR DICK. SORRY. NOT SORRY.', "IT POPPED. YOU'RE NAKED. EVERYTHING'S WORSE.", "DON'T LICK IT OFF. I KNOW YOUR TYPE."],
);
/** His short leg gives out: down on his knee, doubled over (the opening). */
export const KID_BUCKLE = bp(
  ['MY SHORT LEG QUIT!', 'I NEED TO SIT. I ALWAYS NEED TO SIT.', 'GIVE ME A MINUTE. GIVE ME TEN.', 'MY KNEE WENT. THE EXTRA ONE.', "THE FLOOR'S COLD. NICE. THAT'S NICE."],
  ["I'M DOWN. DON'T SIT ON ME. YOU'RE WET.", 'MY LEG QUIT. IT SMELLED YOU.', "DON'T COME CLOSE. YOU'RE DRIPPING."],
  ["I'M ON MY KNEES AND YOU'RE NAKED. NO.", "MY LEG GAVE OUT. DON'T GET IDEAS.", "DOWN. DON'T STAND OVER ME NAKED."],
);
/** Retching, before the puke. */
export const KID_RETCH = bp(
  ["I'M GONNA... HURK.", "DINNER'S COMING BACK. IT WAS MOM'S.", "MY STOMACH'S GOT A STOMACH.", 'OH NO. OH NO. HERE IT COMES.'],
  ["YOUR SMELL! IT'S COMING UP!", 'YOU DID THIS. HURK.', 'I CAN TASTE YOU. HURK.'],
  ['I LOOKED AT IT. NOW I GOTTA PUKE.', 'YOUR DICK MADE ME GAG.', 'TOO MUCH NAKED. HURK.'],
);
/** Got him: the squeeze. */
export const KID_GRAB = bp(
  ['HUG. MOM NEVER HUGS ME.', "HOLD STILL. I'M SQUEEZING.", "YOU'RE WARM. I'M ALWAYS COLD.", 'JUST LET ME HOLD YOU. TILL YOU POP.'],
  ["YOU'RE WARM. WHY ARE YOU WARM BACK THERE.", 'SQUEEZE. OH GOD. IT CAME OUT YOUR LEGS.', "I'M HUGGING SHIT. THAT'S MY LIFE."],
  ["YOU'RE SO SMOOTH. I HATE THIS.", 'NAKED HUG. MOM CAN NEVER KNOW.', "SOMETHING'S TOUCHING MY GUT. IT'S YOURS."],
);
/** Meathead, in the squeeze. */
export const MH_GRABBED = bp(
  ["HE'S DROOLING IN MY EAR!", 'LET GO, YOU BOIL!', "YOUR BREATH! IT'S HOT HAM!"],
  ['SQUEEZE HARDER, IT COMES OUT THE LEGS!', "YOU'RE PUSHING IT OUT, YOU FREAK!", "LET GO! I'M LEAKING!"],
  ['YOUR RASH IS ON MY BALLS!', 'MY BARE ASS IS ON YOUR BOILS!', "LET GO! I'M NAKED IN A PUS HUG!"],
);
/** Meathead, watching the misery (now and then). */
export const MH_REACT = bp(
  ['QUIT WHINING AND DIE.', "THAT'S THE SADDEST THING I EVER SHOT.", 'I FEEL BAD. NOT BAD ENOUGH.', 'SOMEBODY GET THIS KID A DOCTOR. THEN SHOOT THE DOCTOR.'],
  ['AND I THOUGHT I WAS GROSS RIGHT NOW.', "YOU'RE GROSSER THAN MY PANTS. CONGRATS.", "WE'RE BOTH LEAKING. IT'S NOT A CONTEST."],
  ["PUT CREAM ON IT. I'M NAKED, I'M NOT JUDGING.", "YOU'RE UGLIER THAN ME AND I'M NAKED.", 'AT LEAST MY RASH IS ON THE INSIDE.'],
);
/** A retry: the short entrance's line. */
export const KID_RETRY = bp(["YOU AGAIN. MOM SAID YOU'D COME BACK."], ["YOU AGAIN. STILL STINKY."], ["YOU AGAIN. STILL NAKED."]);
/** (the death screen at the summit, whatever got him: the stage's say) */
export const SUMMIT_DEATH = ['KILLED BY THE INBRED KID', 'DEAD AT 1,000 FEET'];

// ---------------------------------------------------------------------------------------------------------------

const all = (...pools: (string | string[] | ByPants)[]) => pools.flatMap(p => (typeof p === 'string' ? [p] : Array.isArray(p) ? p : Object.values(p).flat()));
export const PARK1_VOICE_LINES: Record<string, string[]> = {
  meathead: all(GRAB_KID, MH_KICK, MH_IN, MH_POSSESSED, MH_SLIDE, MH_CRATER, MH_PELICAN, MH_TUBE, MH_TUBE_DONE, MH_TUBE_CLEAR, MH_EVEREST, MH_LOCKED, MH_FLOOR_DONE, MH_SUMMIT, MH_STUB, MH_FALL, MH_INTRO, MH_RIDE, MH_GRABBED, MH_REACT, ...Object.values(HURT).map(h => h.hurt)),
  death: all(...Object.values(HURT).map(h => h.death), TUBE_DEATH, SUMMIT_DEATH),
  [KID_VOICE]: all(KID_INTRO, KID_INTRO2, KID_TAUNT, KID_HURT, KID_LOW, KID_DEATH, KID_RETRY, KID_WHINE, KID_SCRATCH, KID_BOIL, KID_BUCKLE, KID_RETCH, KID_GRAB),

  [DPOS_VOICE.m]: all(DPOS_BARK), [DPOS_VOICE.f]: all(DPOS_BARK),
  [APOS_VOICE.m]: all(APOS_BARK), [APOS_VOICE.f]: all(APOS_BARK),
};
