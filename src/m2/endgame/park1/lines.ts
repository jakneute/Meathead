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
  'm2:wp_kid': { hurt: ['THE KID! THE FUCKING KID!', "YOUR MOM'S YOUR AUNT, YOU FREAK!", 'STOP FLAILING, YOU INBRED FUCK!'], death: ['KILLED BY THE INBRED KID', 'TAKEN OUT BY A MUTANT'] },
  'm2:wp_kidshot': { hurt: ['THE KID SHOOTS TOO! GREAT!', 'WHICH ARM DID THAT COME OUT OF?!', 'THE KID GOT ME!'], death: ['SHOT BY THE KID', 'THE THIRD ARM GOT ME'] },
  'm2:wp_kidslam': { hurt: ['HE LANDED ON ME!', 'GET YOUR FAT ASS OFF ME!', 'THE KID FELL ON ME!'], death: ['SAT ON BY THE KID', 'CRUSHED BY THE KID'] },
  'm2:wp_kidsnow': { hurt: ['FAKE SNOW! IT HURTS!', 'AN ICE BALL! IN FLORIDA!', 'THE KID THREW SNOW!'], death: ['KILLED BY FAKE SNOW', 'ICED BY THE KID'] },
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
export const KID_INTRO = bp(
  ["YOU'RE THE GUY WHO KILLED MY DAD. AND MY UNCLE. SAME GUY. HE WAS BOTH."],
  ["YOU'RE THE GUY WHO KILLED MY DAD. YOU SMELL LIKE YOU KILLED HIM WITH YOUR ASS."],
  ["YOU'RE THE GUY WHO KILLED MY DAD. AND YOU'RE NAKED. MOM DIDN'T SAY THAT."],
);
export const MH_INTRO = bp(["WHAT THE FUCK ARE YOU?"], ["WHAT THE FUCK IS THAT. AND I SAY THAT SMELLING LIKE THIS."], ["WHAT THE FUCK. AND I'M THE ONE WITH MY DICK OUT."]);
export const KID_INTRO2 = bp(
  ["MOM SAYS IF I KILL YOU I CAN HAVE MY OWN POD. I'M TWENTY-SIX."],
  ["MOM SAYS KILL YOU AND I GET MY OWN POD. AND WASH MY HANDS AFTER."],
  ["MOM SAYS KILL YOU AND I GET MY OWN POD. DON'T MAKE IT WEIRD."],
);
/** Taunts mid-fight. */
export const KID_TAUNT = bp(
  ["I HAVE THREE ARMS. YOU HAVE TWO. DO THE MATH.", "MY EYES DON'T AGREE WHERE YOU ARE. ALL OF THEM ARE RIGHT.", "DAD WAS MY DAD AND MY UNCLE. CHRISTMAS WAS CHEAP."],
  ["YOU SMELL LIKE MY ROOM.", "MOM'S GONNA MAKE ME HOSE OFF THE SUMMIT.", "I CAN SMELL YOU WITH ALL MY NOSES."],
  ["PUT IT AWAY, MAN.", "I'M NOT LOOKING AT IT. TWO OF MY EYES ARE.", "MOM WARNED ME ABOUT NAKED HUMANS. SHE WAS RIGHT."],
);
/** Hurt. */
export const KID_HURT = bp(
  ['OW! MOM!', "THAT'S MY GOOD ARM!", 'OW, MY EXTRA KNEE!'],
  ['OW! YOU GOT SHIT ON ME!', 'GROSS! OW!'],
  ['OW! YOUR THING TOUCHED ME!', 'OW! COVER IT!'],
);
/** Its tantrum (low health). */
export const KID_LOW = bp(["I'M TELLING MOM!", "THIS ISN'T FAIR! NOTHING'S EVER FAIR!"], ["I'M TELLING MOM YOU'RE GROSS!"], ["I'M TELLING MOM YOU WERE NAKED!"]);
/** Its standard death: a last line, slumped in the slide's mouth. */
export const KID_DEATH = bp(["TELL MOM... I CLEANED MY POD."], ["TELL MOM... YOU SMELLED."], ["TELL MOM... I DIDN'T LOOK."]);
/** Meathead, killing it: riding the kid down the slide. */
export const MH_RIDE = bp(["HOP IN, KID. LET'S GO HOME."], ["MOVE OVER, KID. YOUR BODY'S MY TUBE."], ["SCOOCH, KID. NAKED BOBSLED."]);
/** At the bottom, the big splash: the owner's "something funny about riding the alien kid down the waterslide". */
export const MH_SPLASH = bp(
  ["BEST TUBE I EVER RODE. A LITTLE BONY IN THE MIDDLE.", "RODE A DEAD ALIEN DOWN A THOUSAND FEET. PUT THAT ON THE BROCHURE."],
  ["RODE THE KID ALL THE WAY DOWN. HE CUSHIONED MY SHIT.", "THE POOL'S GREEN NOW. AND BROWN. MOSTLY GREEN."],
  ["RODE THE KID DOWN BARE ASS. HE WAS STILL WARM. DON'T THINK ABOUT IT.", "NAKED ON A DEAD ALIEN, A THOUSAND FEET. NEW RECORD."],
);
/** Grabbing him (too big). */
export const GRAB_KID = ["HE'S HUGE. AND MOIST.", "TOO BIG. TOO SLIMY. TOO MANY ARMS.", "I'M NOT TOUCHING THAT."];
/** A retry: the short entrance's line. */
export const KID_RETRY = bp(["YOU AGAIN. MOM SAID YOU'D COME BACK."], ["YOU AGAIN. STILL STINKY."], ["YOU AGAIN. STILL NAKED."]);
/** (the death screen at the summit, whatever got him: the stage's say) */
export const SUMMIT_DEATH = ['KILLED BY THE INBRED KID', 'DEAD AT 1,000 FEET'];

// ---------------------------------------------------------------------------------------------------------------

const all = (...pools: (string | string[] | ByPants)[]) => pools.flatMap(p => (typeof p === 'string' ? [p] : Array.isArray(p) ? p : Object.values(p).flat()));
export const PARK1_VOICE_LINES: Record<string, string[]> = {
  meathead: all(GRAB_KID, MH_KICK, MH_IN, MH_POSSESSED, MH_SLIDE, MH_CRATER, MH_PELICAN, MH_TUBE, MH_TUBE_DONE, MH_TUBE_CLEAR, MH_EVEREST, MH_LOCKED, MH_FLOOR_DONE, MH_SUMMIT, MH_STUB, MH_FALL, MH_INTRO, MH_RIDE, MH_SPLASH, ...Object.values(HURT).map(h => h.hurt)),
  death: all(...Object.values(HURT).map(h => h.death), TUBE_DEATH, SUMMIT_DEATH),
  [KID_VOICE]: all(KID_INTRO, KID_INTRO2, KID_TAUNT, KID_HURT, KID_LOW, KID_DEATH, KID_RETRY),
  [DPOS_VOICE.m]: all(DPOS_BARK), [DPOS_VOICE.f]: all(DPOS_BARK),
  [APOS_VOICE.m]: all(APOS_BARK), [APOS_VOICE.f]: all(APOS_BARK),
};
