// What's said in CHELSEA AND SOCKS' WACKY WHITE HOUSE ADVENTURES, part one, by voice (cartoon/voices.ts gathers it;
// tools/voices records it). Pure data (tools/voices bundles it in node).
//
// The satire (the user's): "who the hell are these people". The show plays its 90s pundits straight, as Saturday
// morning cartoon villains spouting their talking points; the joke is Meathead not getting any of it, and wondering
// what psycho kid watches this. Never anything about his age.
//
// MEATHEAD (drawn back in as Socks the cat): blunt, short, vulgar; baffled; he tells Chelsea to shut up.
// CHELSEA (m2.cartoon.chelsea): the show's cartoon Chelsea, really a grown woman doing a kid's voice on the stage
// behind the projection: chirpy, bossy, nagging like a fairy in a sword game; after a pundit dies she's plainly about to
// be sick (the real thing leaking through) but stays in character and hurries him on.
// ROSS PEROT (m2.cartoon.perot) and JERRY FALWELL (m2.cartoon.falwell): the show's impersonators, hammy cartoon villains.
// THE MEAN MEN: the show's henchmen (goons, lobbyists, pollsters), on the clock.

import { allOf, type ByPants, type HurtTable } from '../talk';

export const CHELSEA = 'm2.cartoon.chelsea';
export const PEROT = 'm2.cartoon.perot';
export const FALWELL = 'm2.cartoon.falwell';
export const MEAN_VOICES = {
  goon: 'm2.cartoon.goon', goonf: 'm2.cartoon.goonf',
  lobbyist: 'm2.cartoon.lobbyist', lobbyistf: 'm2.cartoon.lobbyistf',
  pollster: 'm2.cartoon.pollster', pollsterf: 'm2.cartoon.pollsterf',
} as const;

// ---------------------------------------------------------------------------------------------------------------
// The transformation (a cutscene: erased, drawn back in as a cat)

/** The eraser coming in, rubbing him out. */
export const ERASED = ['HEY. HEY! WHAT THE FUCK?'];
/** Drawn back in: him, looking himself over. */
export const REDRAWN: ByPants = {
  clean: ["I'M A CAT. I'M A FUCKING CAT.", "I HAVE A TAIL. IT'S COMING OUT OF MY ASS."],
  shitty: ["I'M A CAT. I STILL SHIT MYSELF. GREAT.", 'THEY DREW ME A TAIL. RIGHT THROUGH THE SHIT.'],
  nude: ["I'M A NAKED CAT. THAT'S JUST A CAT.", 'THEY DREW ME FUR EVERYWHERE BUT THE PART THAT MATTERS.'],
};
/** Chelsea, running in: the setup (the user's, near enough), then the nag that starts it all. */
export const CHELSEA_INTRO = ['HI, SOCKS! MOM AND DAD ARE AT A UN SUMMIT, AND MEAN MEN HAVE INVADED THE WHITE HOUSE!'];
export const CHELSEA_INTRO2: ByPants = {
  clean: ["IT'S JUST YOU AND ME, SOCKS! WE HAVE TO STOP THEM! FOR AMERICA!"],
  shitty: ['AND SOMEBODY MADE A STINKY! WAS IT THE MEAN MEN? WE HAVE TO STOP THEM!'],
  nude: ["SOCKS, WHERE ARE YOUR PANTS? NEVER MIND! WE HAVE TO STOP THE MEAN MEN!"],
};
/** ...and him. */
export const SHUT_UP_FIRST: ByPants = {
  clean: ['SHUT UP.', 'SHUT UP. WHO ARE YOU?', "WHOSE KID IS THIS? SHUT UP."],
  shitty: ['SHUT UP. IT WAS ME.', 'WHO ARE YOU? AND YEAH. IT WAS ME. OBVIOUSLY.'],
  nude: ['SHUT UP. CATS DON\'T WEAR PANTS.', 'WHO ARE YOU? GO GET ME A TOWEL. A BIG ONE.'],
};
/** Back in later (been redrawn before): a quick scribble back into the cat, his line. */
export const REDRAWN_AGAIN: ByPants = {
  clean: ['AGAIN WITH THE CAT.', 'BACK TO BEING A CAT. MY LIFE IS A FUCKING JOKE.'],
  shitty: ['A CAT AGAIN. A SHITTY CAT.', 'CAT AGAIN. SAME SHITTY BUTT FUR.'],
  nude: ['NAKED CAT. AGAIN.', 'BACK TO THE FUR. STILL A DICK ON IT.'],
};

// ---------------------------------------------------------------------------------------------------------------
// Chelsea, nagging

/** Every so often, wherever (talk less: she does enough for both of them). */
export const NAG: ByPants = {
  clean: [
    'SOCKS! THIS WAY!', 'HEY! HEY, SOCKS! THE MEAN MEN WENT THIS WAY!', "SOCKS, YOU'RE SUPPOSED TO BE HELPING!",
    'DAD SAYS A GOOD CAT NEVER GIVES UP!', "COME ON, SOCKS! AMERICA'S COUNTING ON US!", 'SOCKS! SOCKS! SOCKS! SOCKS!',
    "MOM SAYS IT TAKES A VILLAGE! YOU'RE THE VILLAGE, SOCKS!",
    "SOCKS! THE MEAN MEN ARE TOUCHING DAD'S SAXOPHONE!", 'SOCKS, MOM SAYS NO SCRATCHING THE FURNITURE! EXCEPT MEAN MEN!',
    'IF WE SAVE THE WHITE HOUSE, WE GET ICE CREAM, SOCKS!', 'LOOK BOTH WAYS, SOCKS! THEN ATTACK!',
    "SOCKS, ARE YOU EVEN LISTENING? CATS NEVER LISTEN!", "THE SECRET SERVICE IS ON A COFFEE BREAK! IT'S ALL UP TO US!",
    "WHAT WOULD ABRAHAM LINCOLN DO, SOCKS? HE'D GO THIS WAY!", 'SOCKS! THIS IS THE MOST IMPORTANT DAY OF YOUR WHOLE LIFE!',
  ],
  shitty: [
    'SOCKS, DID YOU GO IN THE HOUSE AGAIN?', 'EW, SOCKS! SOMEBODY GET THE LITTER BOX!', "SOCKS, YOU SMELL LIKE THE PRESS ROOM!",
    'SOCKS, THE MAIDS ARE GOING TO BE SO MAD!', 'WE HAVE A SANDBOX FOR THAT, SOCKS!', 'PEE-YEW! HOLD YOUR BREATH, AMERICA!',
    "SOCKS, THAT'S A NATIONAL EMERGENCY!", 'SOCKS! DID YOU HAVE AN ACCIDENT?!', "SOCKS, YOUR BUTT FUR IS ALL CRUSTY! EW! EW! EW!",
    "DON'T SIT ON THE CARPET, SOCKS! IT'S FROM THE NINETEEN HUNDREDS!", "MOM'S GONNA KILL US, SOCKS! THAT'S THE PRESIDENTIAL RUG!",
    "HOLD STILL, SOCKS! I'LL WIPE YOU WITH A NAPKIN! NO, YOU DO IT!", "SOCKS, YOU'RE LEAVING A TRAIL! THE MEAN MEN CAN FOLLOW IT!",
  ],
  nude: [
    'SOCKS! WHERE DID YOUR PANTS GO?', "CATS DON'T WEAR PANTS ANYWAY! I THINK!", "SOCKS, PUT SOMETHING ON! THE PRESS IS WATCHING!",
    'SOCKS, EVEN THE MEAN MEN WEAR SUITS!', 'MOM SAYS DRESS FOR THE JOB YOU WANT, SOCKS!', 'SOCKS! THE PORTRAITS ARE WATCHING!',
    'SOCKS, WE ARE NOT TELLING DAD ABOUT THIS!',
  ],
};
/** Said once each, the first time he gets there. */
export const HINT: Record<'vacuum' | 'wax' | 'chandelier' | 'stairs' | 'roses' | 'sprinkler' | 'blimp' | 'dining' | 'upstairs', string[]> = {
  vacuum: ["THAT'S THE HOOVER! IT ATE MY HAMSTER!"],
  wax: ['THE MAIDS JUST WAXED! SLIPPY SLIPPY!'],
  chandelier: ['THE CHANDELIER, SOCKS! LIKE IN THE MOVIES!'],
  stairs: ["THE MEAN MEN ARE BOWLING IN DAD'S BOWLING ALLEY! THEY'RE ROLLING THE BALLS DOWN THE STAIRS!"],
  roses: ["DON'T TOUCH MOM'S ROSES! THEY'RE POINTY!"],
  sprinkler: ['THE SPRINKLERS! CATS HATE WATER!'],
  blimp: ["THAT'S A SPY BLIMP! THE MEAN MEN ARE WATCHING US!"],
  dining: ["THE MEAN MEN ARE EATING THE STATE DINNER! THAT WAS FOR THE PRIME MINISTER OF CANADA!"],
  upstairs: ['THE LINCOLN BEDROOM IS UP HERE! NOBODY IS ALLOWED IN THE LINCOLN BEDROOM!'],
};
/** He's hurt (now and then). */
export const OUCH = [
  'SOCKS! ARE YOU OKAY?', 'BAD MAN! YOU HURT SOCKS!', 'SOCKS, NO! GET UP!', 'SOCKS! YOU HAVE NINE LIVES! USE ONE!',
  'WALK IT OFF, SOCKS!', 'THAT LOOKED LIKE IT HURT! DID IT HURT?', "SOCKS! I'LL GET A BAND-AID! A BIG ONE!",
];
/** He tells her to shut up (the user's: "any time chelsea clinton tells socks what to do in the platforming parts,
 *  meathead tells her to shut up": after every nag and every hint of hers). */
export const SHUT_UP: ByPants = {
  clean: [
    'SHUT UP.', 'SHUT UP, KID.', "I'M NOT YOUR CAT.", 'NOBODY ASKED YOU.', 'SHUT. UP.', 'I HEARD YOU THE FIRST TIME.',
    "WHERE'S THE MUTE BUTTON ON THIS THING?", "ONE MORE 'SOCKS' AND I QUIT.", 'POINT ONE MORE TIME. I DARE YOU.', 'GO NAG A LOBBYIST.',
    'SHUT YOUR HEADBAND HOLE.', 'YOU DO IT THEN.', "I GOT EYES, KID. CAT EYES. THEY'RE GREAT.", 'NOBODY PUT YOU IN CHARGE.', 'ZIP IT, CHELSEA.',
    'YOU POINT ONE MORE TIME, I BITE THE FINGER.', 'SHUT UP. I KNOW WHERE THE DOOR IS.', "TELL YOUR DAD. I DON'T KNOW HIM EITHER.",
    'THANKS, NAVI. SHUT UP.', "I DIDN'T ASK FOR A FUCKING TOUR.",
    'CHELSEA? LIKE THE SOCCER TEAM? SHUT UP.', 'SHUT UP, KELSEY.', "WHO ARE YOU? THE CAT'S OWNER?", "ARE YOU THE BABYSITTER? YOU'RE FIRED.",
    'SHUT UP, INTERN.', "SHUT UP, CHELSEA. WHO'S CHELSEA?", 'GO NAG YOUR OWN PARENTS. WHOEVER THEY ARE.',
  ],
  shitty: [
    'SHUT UP. I KNOW. I SMELL IT TOO.', 'SHUT UP ABOUT THE LITTER BOX.', 'SHUT UP OR YOU GET A SHITTY HUG.', "YES, IT'S ME. WHO ELSE? THE SAXOPHONE?",
    "I'LL BURY IT LATER. SHUT UP.", 'SAY STINKY ONE MORE TIME.', "SHUT UP. I'M LEAKING HERE.", "QUIT BOSSING A GUY WHO SHIT HIMSELF.",
    'SHUT UP AND HOLD YOUR NOSE.', 'I GOT ENOUGH IN MY BUTT FUR WITHOUT YOU.', "SHUT UP. EVERY STEP'S SQUISHY.",
    "ORDERS FROM A KID. AND I'M THE ONE WHO SHIT.", 'SHUT UP OR I SIT ON YOU.', 'NOT NOW. MY ASS IS A CRIME SCENE.',
    'SHUT UP, BABYSITTER. GO GET WIPES.', 'SHUT UP, KELSEY. I KNOW I STINK.', 'WHOEVER YOUR PARENTS ARE, I SHIT ON THEIR RUG.',
    'SHUT UP, INTERN. FETCH ME PANTS.',
  ],
  nude: [
    'SHUT UP AND STOP LOOKING.', "SHUT UP. YOU SAID CATS DON'T WEAR PANTS.", 'SHUT UP. EYES UP HERE.', 'QUIT POINTING. I KNOW WHERE IT IS.',
    "PANTS AREN'T IN THE SCRIPT. SHUT UP.", 'NOBODY TELLS DAD. GOT IT.', "SHUT UP. I'M COLD.", 'TELL A NAKED GUY WHAT TO DO. GO AHEAD.',
    "SHUT UP. EVERYTHING'S OUT AND SWINGING.", "I'LL GO WHEN I FIND PANTS.", 'SHUT UP AND FACE THE WALL.',
    "DON'T TALK TO ME. I'M NAKED.", 'NAKED AND NAGGED. WORST SATURDAY EVER.', "SHUT UP. YOU'RE NOT HELPING AND I'M NOT DRESSED.",
    'SHUT UP, INTERN. GO FIND ME PANTS.', 'SHUT UP, KELSEY. GET ME A TOWEL.', 'ARE YOU THE BABYSITTER? I NEED A ROBE.',
    'WHO ARE YOU? THE CAT LADY? GO GET PANTS.',
  ],
};
/** ...and at what she just told him, by her hint (both halves'; any state). */
export const HINT_RETORT: Record<string, string[]> = {
  vacuum: ['IT ATE YOUR HAMSTER. HAMSTER HAD IT COMING.', 'SHUT UP ABOUT THE VACUUM.'],
  wax: ['I KNOW IT\'S SLIPPY. SHUT UP.', 'SAY SLIPPY AGAIN. ONE MORE TIME.'],
  chandelier: ["IT'S A LAMP. SHUT UP.", "IT'S A LAMP, KID. A FANCY LAMP."],
  stairs: ['I SEE THE BALLS. SHUT UP.', 'YOUR DAD BOWLS? WHO THE FUCK IS YOUR DAD?'],
  roses: ['SHUT UP ABOUT THE FLOWERS.', "THEY'RE POINTY. I GOT IT."],
  sprinkler: ['I KNOW CATS HATE WATER. I HATE YOU.', "SHUT UP. IT'S A SPRINKLER, NOT THE FUCKING OCEAN."],
  blimp: ['IT\'S A BALLOON. SHUT UP.', "LET IT WATCH. SHOW'S FREE."],
  dining: ["CANADA CAN EAT A CHEESEBURGER. SHUT UP.", 'NOBODY CARES ABOUT CANADA. NOT EVEN CANADA.'],
  upstairs: ['THEN WHY ARE WE GOING IN?', "SHUT UP. I'M A CAT. I SHIT WHERE I WANT."],
  westwing: ['MOSTLY. SHUT UP.', "I DON'T CARE WHERE HE WORKS."],
  drawers: ['I SEE THE DRAWERS. SHUT UP.', 'CLIMB THEM YOURSELF, HEADBAND.'],
  ditto: ['GOOD FOR HIM. SHUT UP.', "I DON'T CARE WHAT HE LISTENS TO."],
  kitchen: ['SECRETLY. EVERYBODY KNOWS. SHUT UP.', 'SHUT UP ABOUT THE CHEESEBURGERS.'],
  jello: ["DON'T SAY BOING.", 'I KNOW IT BOUNCES. SHUT UP.'],
  map: ["I WASN'T GONNA TOUCH IT. NOW I AM.", "SHUT UP ABOUT THE GLOBE."],
  lasers: ['I KNOW HOW LASERS WORK. SHUT UP.', 'YOU TIME IT.'],
  sweep: ['YOU TIME IT. SHUT UP.', "UP AND DOWN. I SEE IT. I'M A CAT, NOT BLIND."],
  oval: ['MEANEST MAN. SURE. SHUT UP.', "GOOD. I'M IN A MOOD."],
};
/** She cheers a mean man going up in his puff (now and then). */
export const CHEER = [
  'YAY, SOCKS!', 'TAKE THAT, MEAN MAN!', 'SOCKS WINS AGAIN!', 'THAT WAS FOR MY GOLDFISH!', 'GOOD KITTY! GOOD KITTY!',
  'DAD WILL GIVE YOU A MEDAL, SOCKS!', 'POW! RIGHT IN THE KISSER!', 'ONE LESS MEAN MAN!', 'HE WENT POOF! WHERE DO THEY GO, SOCKS?',
  "YOU'RE THE BEST CAT IN AMERICA!", 'MOM SAYS VIOLENCE IS NEVER THE ANSWER! EXCEPT RIGHT NOW!', 'SOCKS FOR PRESIDENT!',
];
/** Cowering by the wall in a pundit's fight (now and then). */
export const COWER = [
  "I'M HIDING, SOCKS! YOU FIGHT!", "DON'T LET HIM GET ME, SOCKS!", "I CAN'T LOOK! TELL ME WHEN IT'S OVER!",
  'BITE HIM, SOCKS! BITE HIS ANKLES!', 'THIS IS WORSE THAN THE PRESS CORPS!', 'SCRATCH HIM, SOCKS! SCRATCH HIM GOOD!',
  "DAD'S GOING TO VETO YOU, MISTER!", "YOU LEAVE MY CAT ALONE!",
];
/** Him on the show itself, now and then between everything (the user's: "make meathead say more lines about how asinine
 *  this show about socks and chelsea is"). */
export const SHOW_MOCK: ByPants = {
  clean: [
    "A CAT AND THE PRESIDENT'S KID FIGHT LOBBYISTS. WHO PITCHED THIS?", 'SATURDAY MORNING. KIDS WANT ROBOTS. THEY GOT TAX POLICY.',
    'SOMEBODY GOT PAID FOR THIS SHOW. HE BOUGHT A BOAT.', 'WHICH KID ASKED FOR THIS? NAME THE KID.', 'THEY BUILT A RIDE FOR THIS. A WHOLE FUCKING RIDE.',
    "A CARTOON ABOUT THE PRESIDENT'S CAT. NEXT WEEK, THE VICE PRESIDENT'S FERN.", 'THE BAD GUYS ARE CALLED MEAN MEN. SIX WRITERS CAME UP WITH THAT.',
    "SHE'S GOT A HEADBAND AND NO JOB. I'M THE CAT AND I DO EVERYTHING.", 'SHE POINTS. I BLEED. EMMY MATERIAL.',
    'THREE EPISODES. I BET IT RAN THREE EPISODES.', 'WHO DREW THIS? EVERY WALL WOBBLES LIKE A DRUNK DREW IT.',
    "THE CAT'S THE HERO. THE CAT. OF THE WHITE HOUSE.", "WHAT'S THE LESSON? CATS HATE LOBBYISTS?",
    'THIS IS A HALF HOUR TOY COMMERCIAL WITHOUT THE TOYS.',
    'CHELSEA? LIKE THE SOCCER TEAM?', "SHE'S THE STAR AND I DON'T KNOW WHO SHE IS.", "SHE'S THE CAT'S OWNER. OR THE BABYSITTER. OR AN INTERN.",
    "THE KID'S PARENTS ARE AT THE UN. WHO ARE THE KID'S PARENTS?",
  ],
  shitty: [
    'EVEN THE CAT SHIT HIMSELF ON THIS SHOW. BEST EPISODE.', "THIS SHOW STINKS. SO DO I. WE'RE PERFECT FOR EACH OTHER.",
    "NOBODY WATCHED THIS. NOBODY'S SMELLING IT EITHER.", 'SATURDAY MORNING CARTOON. I SMELL LIKE SUNDAY NIGHT.',
    'A CAT WHO SHITS HIMSELF. FINALLY THE SHOW MAKES SENSE.', 'THEY NEVER AIRED THIS. THE MASTER TAPE IS IN A LANDFILL.',
    "WHOEVER THIS KID IS, SHE'S NOT CHANGING ME.", 'CHELSEA. LIKE THE SOCCER TEAM. SMELLS LIKE THEIR LOCKER ROOM.',
  ],
  nude: [
    'A NAKED CAT IN THE WHITE HOUSE. FINALLY SOMETHING TO WATCH.', 'CATS ARE ALWAYS NAKED. THIS ONE JUST HAS A DICK FOR SOME REASON.',
    "NO PANTS ON THE CAT. THE NETWORK'S GONNA LOVE THAT.", 'NAKED. A CAT. CHASING LOBBYISTS. RATINGS GOLD.',
    "IF THIS SHOW GOT CANCELED, IT'S THE CARTOON DICK.", 'THE KID KEEPS SAYING SOCKS. I HAVE NO SOCKS. I HAVE NOTHING.',
    "SOME KID'S CAT. NO PANTS. WHOSE KID IS SHE?", 'CHELSEA? LIKE THE SOCCER TEAM? THEY GOT SPARE SHORTS?',
    'THEY DREW THE CAT A DICK. FOR A KIDS SHOW.', "IT BOUNCES. WHY DID THEY ANIMATE IT BOUNCING?",
    'SOMEBODY AT THE STUDIO SPENT A WEEK ON THIS DICK.',
  ],
};
/** Him over a mean man going up in his puff (now and then). */
export const KILL_QUIP: ByPants = {
  clean: [
    'POOF. NO BODY. KID FRIENDLY.', 'PUFFED. FOR THE CHILDREN. THE PSYCHO CHILDREN.', "THAT ONE WASN'T EVEN MEAN. JUST MEDIUM.",
    'HOW MANY MEAN MEN DO THEY HAVE?', 'WHERE DO THE PUFFS GO? HELL? CANADA?', 'THE KIDS LOVED THAT. BOTH OF THEM.',
    'SMOKE AND A SOUND EFFECT. THAT COUNTS AS DEAD ON SATURDAYS.', 'MEAN MAN DOWN. CUT TO A CEREAL COMMERCIAL.',
  ],
  shitty: ["PUFF. THE SMELL'S STILL ME. ALWAYS ME.", 'HE DIED SMELLING ME. MERCY.', 'POOF. WISH MY PANTS DID THAT.', "GONE IN A CLOUD. I'VE GOT MY OWN CLOUD."],
  nude: ['PUFFED BY A NAKED CAT. PUT THAT ON THE LUNCHBOX.', 'POOF. AT LEAST HE STOPPED STARING AT MY CAT DICK.', 'NAKED CAT ONE, MEAN MAN ZERO.', 'HE SAW IT. THEN HE WAS SMOKE.', 'POOF. THE LAST THING HE SAW WAS IT BOUNCING.'],
};
/** A pundit's coming (she names him before the fight starts: in character). */
export const PEROT_COMING = ["OH NO! IT'S ROSS PEROT! AND HE'S GOT CHARTS!"];
export const FALWELL_COMING = ["OH NO, SOCKS! IT'S JERRY FALWELL! AND HE'S IN THE LINCOLN BEDROOM!"];
/** A pundit's dead: she's about to be sick (it's real, the stage behind the screen) but stays in character, hurrying
 *  him on. */
export const QUEASY_PEROT = ['YAAAY! YOU BEAT HIM, SOCKS! HURK. THE NEXT MEAN MAN WENT TOWARD THE DINING ROOM! HURRY!'];
export const QUEASY_FALWELL = ["YOU DID IT! HE WENT... POOF! URP. I'M FINE! I'M FINE! THE REST ARE IN THE WEST WING! COME ON!"];

// ---------------------------------------------------------------------------------------------------------------
// Meathead

/** Once each a visit, at what he's passing. */
export const GAGS: Record<'hairball' | 'vacuum' | 'wax' | 'chandelier' | 'stairs' | 'garden', ByPants> = {
  /** The first hairball he spits. */
  hairball: {
    clean: ["I'M SPITTING HAIRBALLS. THAT'S MY GUN NOW.", 'THEY TOOK MY GUN AND GAVE ME A HAIRBALL. FUCK THIS SHOW.'],
    shitty: ['HAIRBALLS OUT THE FRONT. YOU KNOW WHAT OUT THE BACK.', "HAIR OUT THE FRONT. SHIT OUT THE BACK. I'M A REAL CAT."],
    nude: ['NAKED AND COUGHING UP HAIR. LIKE MY UNCLE AFTER A BENDER.', 'I SPIT HAIRBALLS NOW. I HAVE NO PANTS. GREAT DAY.'],
  },
  vacuum: {
    clean: ['A VACUUM WITH NOBODY PUSHING IT. SURE. CARTOONS.', "IT'S A HOOVER. EVERYTHING IN THIS HOUSE WANTS ME DEAD."],
    shitty: ['THAT VACUUM IS NOT CLEANING THIS UP.', 'SUCK THIS UP? THE BAG WILL BURST.'],
    nude: ['NOT THE HOSE. NOT NEAR THE CAT DICK.', "KEEP THAT HOSE AWAY FROM MY BALLS."],
  },
  wax: {
    clean: ['THE FLOOR IS GREASED. OF COURSE IT IS.', "WAXED FLOOR. CATS DON'T GET TRACTION. FUCK."],
    shitty: ['SLIPPERY FLOOR. SLIPPERY PANTS. BAD COMBO.', "IF I FALL, I SKID A BROWN STREAK ACROSS THE PRESIDENT'S FLOOR."],
    nude: ['SLIDING ON A FLOOR NAKED. THAT BURNS.', 'BARE ASS ON A WAXED FLOOR. RUG BURN ON THE BALLS.'],
  },
  chandelier: {
    clean: ['RIDING A CHANDELIER. BEST RIDE IN THE PARK SO FAR.', 'NOW THIS IS A RIDE. THANKS, TAXPAYERS.'],
    shitty: ["DON'T LOOK UP, EVERYBODY. IT DRIPS.", 'SWINGING. SOMETHING ELSE IS SWINGING TOO.'],
    nude: ['SWINGING NAKED FROM A CHANDELIER. LIKE COLLEGE.', "THE CHANDELIER'S SWINGING. SO'S EVERYTHING ELSE."],
  },
  stairs: {
    clean: ['BOWLING BALLS DOWN THE STAIRS. FINALLY SOMETHING FUN.', "THEY'RE BOWLING AT A CAT. IN THE WHITE HOUSE. MAKES SENSE."],
    shitty: ['A BALL TO THE GUT AND I PAINT THESE STAIRS.', 'HIT ME IN THE GUT AND IT ALL COMES OUT.'],
    nude: ['TWO BALLS COMING DOWN, TWO BALLS DANGLING UP HERE.', "TWO BALLS AND A PIN DOWN HERE. DON'T STRIKE."],
  },
  garden: {
    clean: ['OUTSIDE. STILL A CARTOON. STILL A FUCKING CAT.', 'A ROSE GARDEN. NOBODY PISS ON ANYTHING. EXCEPT ME.'],
    shitty: ["FRESH AIR. DOESN'T HELP. NOTHING HELPS.", 'MAYBE I CAN BURY IT LIKE A CAT.'],
    nude: ['NAKED IN THE ROSE GARDEN. WATCH THE THORNS.', 'A NAKED CAT IN A GARDEN. JUST HOW GOD AND SOME ANIMATOR MADE ME.'],
  },
};

// ---------------------------------------------------------------------------------------------------------------
// The pundits (the show's: cartoon villains, their 90s talking points played straight) and Meathead baffled by them

export interface PunditLines {
  /** His entrance (the fight's opening: he's said his piece, Meathead says his). */
  intro: ByPants; reply: ByPants;
  /** His taunts as he fights (barks: one at a time, now and then). */
  taunt: ByPants;
  /** Him throwing something. */
  toss: string[];
  /** Meathead, mid-fight, now and then (baffled). */
  baffled: ByPants;
  /** Going up in his puff. */
  death: ByPants;
  /** Meathead over it. */
  after: ByPants;
}

export const PEROT_LINES: PunditLines = {
  intro: {
    clean: ["WELL, HOWDY, KITTY! IT'S ME, ROSS PEROT! NOW LISTEN UP, 'CAUSE I'M ALL EARS!"],
    shitty: ["HOWDY, KITTY! WHEW! SMELLS LIKE THE NATIONAL DEBT IN HERE! IT'S ME, ROSS PEROT!"],
    nude: ["HOWDY, KITTY! SON, YOU'RE SHOWIN' MORE THAN MY PIE CHART! IT'S ME, ROSS PEROT!"],
  },
  reply: {
    clean: ['WHO THE HELL ARE YOU?', 'WHO? WHO THE FUCK?', "WHO'S THE EARS GUY?", 'ROSS WHO? YOU SELL CARS?', 'WHO ARE YOU? A LEPRECHAUN WITH A BANK?'],
    shitty: ["I DON'T KNOW WHO YOU ARE, AND I SHIT MYSELF.", "WHO? AND DON'T SNIFF IN MY DIRECTION.", "WHO'S THE EARS GUY? AND YEAH, THAT'S ME.", 'ROSS WHO? YOU SELL PANTS? I NEED PANTS.'],
    nude: ['WHO? AND STOP LOOKING AT IT, EARS.', "I DON'T KNOW YOU. YOU'VE SEEN MY DICK.", "WHO'S THE EARS GUY? EYES UP, EARS.", 'ROSS WHO? YOU GOT A ROBE IN THOSE CHARTS?'],
  },
  taunt: {
    clean: [
    "YOU HEAR THAT, KITTY? THAT'S A GIANT SUCKING SOUND!", "NOW WATCH CLOSE. THIS HERE'S A PIE CHART!", "IT'S JUST THAT SIMPLE!",
    'THE DEFICIT IS AS BIG AS MY EARS!', 'NOW LET ME FINISH! LET ME FINISH!', "I'M BUYIN' THIS WHOLE WHITE HOUSE! CASH!",
    "THAT'S A JOB GOIN' SOUTH, SON!", "GET UNDER THE HOOD AND FIX IT! THAT'S ALL IT IS!",
    ],
    shitty: ['WHEW! THAT SMELL IS GOIN\' SOUTH OF THE BORDER, SON!', 'THAT SMELL IS A GIANT SUCKING SOUND!'],
    nude: ["SON, PUT IT IN A BLIND TRUST!", "I'M ALL EARS, KITTY! NOT ALL EYES! PUT IT AWAY!", "LOOK AT IT BOUNCE! THAT'S A GIANT FLOPPING SOUND!"],
  },
  toss: ['PIE CHART!', 'HERE COMES THE DATA!', 'CHART THIS!', 'GRAPHS!'],
  baffled: {
    clean: [
      "WHAT'S A NAFTA?", 'WHAT THE FUCK IS HE TALKING ABOUT?', 'WHY ARE HIS EARS SO BIG?', 'WHAT KID WATCHES THIS?',
      'A PIE CHART. IN A CARTOON. FOR KIDS.', "THE VILLAIN IS A SHORT GUY WITH GRAPHS. I'M SHAKING.", "IS THIS EDUCATIONAL? I FEEL DUMBER. AND I'M A CAT.",
      "I STILL DON'T KNOW WHO YOU ARE, EARS.", "ARE YOU SOMEBODY'S UNCLE? WHOSE UNCLE?", 'PEROT. IS THAT A CAR? YOU SOUND LIKE A CAR.',
    ],
    shitty: ["I DON'T KNOW WHAT A NAFTA IS. I KNOW WHAT A SHART IS.", 'GIANT SUCKING SOUND. THAT WAS MY PANTS.', "CHART THIS. IT'S TRENDING DOWN MY LEG.",
      "STILL DON'T KNOW YOU, EARS. YOU KNOW MY PANTS.", 'WHOSE UNCLE ARE YOU? GO GET ME WIPES.'],
    nude: ['WHO SHOWS A NAKED CAT A PIE CHART?', "I DON'T KNOW YOU AND YOU KEEP LOOKING DOWN.", 'HIS EARS ARE BIGGER THAN MY DICK. CARTOON DICK. STILL.',
      "STILL DON'T KNOW YOU, EARS. YOU KNOW MY DICK.", "SOMEBODY'S UNCLE IS LOOKING AT MY DICK."],
  },
  death: {
    clean: ["WELL, THAT'S JUST SAD! I'M DROPPIN' OUT OF THE RACE!"],
    shitty: ["WELL, THAT'S JUST SAD! AND STINKY! I'M DROPPIN' OUT!"],
    nude: ["WELL, THAT'S JUST SAD! AND NAKED! I'M DROPPIN' OUT!"],
  },
  after: {
    clean: ["I STILL DON'T KNOW WHO THAT WAS.", 'WHAT PSYCHO KID WATCHES THIS?'],
    shitty: ['NO IDEA WHO THAT WAS. NEED NEW PANTS.', 'WHOEVER HE WAS, HE DIED SMELLING CAT SHIT.'],
    nude: ['NO IDEA WHO THAT WAS. HE SAW EVERYTHING.', 'BIG EARS. SAW MY DICK. GONE.'],
  },
};

export const FALWELL_LINES: PunditLines = {
  intro: {
    clean: ["REPENT, KITTY CAT! I'M THE REVEREND JERRY FALWELL, AND THE MORAL MAJORITY HAS COME TO CLEAN HOUSE!"],
    shitty: ["REPENT, KITTY CAT! I'M THE REVEREND JERRY FALWELL! AND I SMELL SIN! IT'S YOU! YOU'RE THE SIN!"],
    nude: ["NAKEDNESS! IN THE LINCOLN BEDROOM! I'M THE REVEREND JERRY FALWELL, AND THIS IS SODOM!"],
  },
  reply: {
    clean: ['WHO THE HELL ARE THESE PEOPLE?', 'WHAT? WHO? WHAT?', "WHO'S THE CHURCH LADY?", 'A PREACHER? ARE YOU THE POPE? YOU LOOK LIKE A HAM.', 'JERRY? LIKE THE MOUSE?'],
    shitty: ["I DON'T KNOW WHO YOU ARE. I'M THE SIN? FINE.", 'WHO? AND WHAT DID I DO? BESIDES MY PANTS.', "WHO'S THE CHURCH LADY? AND YEAH, I'M THE SIN.", 'ARE YOU THE POPE? BLESS MY PANTS.'],
    nude: ['WHO? AND WHY IS EVERYBODY LOOKING DOWN?', "I DON'T KNOW YOU, PREACHER. EYES UP.", "WHO'S THE CHURCH LADY? QUIT LOOKING.", "ARE YOU THE POPE? THE POPE DOESN'T STARE."],
  },
  taunt: {
    clean: [
      'THE GAY AGENDA IS COMING FOR OUR CARTOONS! NOT ON MY WATCH!', 'TWO DADDIES? NOT IN THIS HOUSE, KITTY!',
      "REPENT! YOUR SOUL'S AS BLACK AS YOUR FUR!", "I'M PRAYING FOR YOU! AT YOU! I'M PRAYING AT YOU!",
      'THE MORAL MAJORITY HAS SPOKEN!', 'PASS THE COLLECTION PLATE! DIG DEEP, SINNER!', 'THIS IS A CHRISTIAN NATION, KITTY!',
      'SECULAR HUMANISM! IN THE WHITE HOUSE!',
    ],
    shitty: ['THE STENCH OF SIN! IT FILLS THE LINCOLN BEDROOM!', 'BRIMSTONE! I SMELL BRIMSTONE! OH, IT\'S YOU.'],
    nude: ['COVER YOUR SHAME, KITTY! COVER IT WITH THIS BIBLE!', 'NAKED AS THE DAY SATAN MADE YOU!', 'STOP BOUNCING THAT THING! THE LORD CAN SEE IT!'],
  },
  toss: ['HAVE A BIBLE!', 'COLLECTION PLATE!', 'TITHE!', 'THE GOOD BOOK!'],
  baffled: {
    clean: [
      'WHAT AGENDA? WHO THE HELL ARE YOU?', 'WHAT KIND OF PSYCHO KID WATCHES THIS?', 'WHY IS THIS A CARTOON? WHO SIGNED THE CHECK?', 'IS THIS A KIDS SHOW? FOR WHAT KIDS?',
      "A PREACHER JUMPING ON LINCOLN'S BED. SATURDAY MORNING.", 'HE THROWS BIBLES. AT A CAT. ON SATURDAY MORNING.',
      'THE CAT IS FIGHTING THE CHURCH NOW. GREAT SEASON FINALE.',
      "STILL DON'T KNOW YOU, CHURCH LADY.", "YOU'RE ON TV AT FOUR IN THE MORNING, RIGHT? YOU LOOK IT.", 'A CAT FIGHTING JERRY. WHERE IS TOM?',
    ],
    shitty: ['I SMELL LIKE SIN. FINE. WHO ARE YOU?', 'HE KEEPS SAYING SIN. HE MEANS MY PANTS.', "PRAY FOR MY PANTS. THEY'RE PAST SAVING.",
      "STILL DON'T KNOW YOU, CHURCH LADY. HOLY WATER MY PANTS.", 'JERRY THE MOUSE SMELLS ME. GOOD.'],
    nude: ["HE KEEPS SAYING SODOM. I'M TAKING IT AS A COMPLIMENT.", 'STOP PRAYING AT MY DICK.', "A NAKED CAT AND A PREACHER IN THE LINCOLN BEDROOM. THAT'S A SCANDAL.",
      "STILL DON'T KNOW YOU, CHURCH LADY. EYES UP.", 'THE POPE IS STARING AT MY DICK. OR WHOEVER YOU ARE.'],
  },
  death: {
    clean: ['CURSES! THE MORAL MAJORITY WILL REMEMBER THIS, KITTY!'],
    shitty: ['CURSES! SMITTEN BY A STINKY CAT! THE MORAL MAJORITY WILL REMEMBER THIS!'],
    nude: ['CURSES! STRUCK DOWN BY A NAKED CAT! IN THE LINCOLN BEDROOM!'],
  },
  after: {
    clean: ['WHO THE HELL ARE THESE PEOPLE?', 'WHAT PSYCHO KID WATCHED THIS SHOW?'],
    shitty: ["GONE. STILL DON'T KNOW HIM. STILL SHITTY.", 'HE CALLED ME SIN. SIN SMELLS LIKE THIS, PREACHER.'],
    nude: ['GONE. HE PRAYED AT MY DICK THE WHOLE TIME.', 'NAKED CAT ONE, PREACHER ZERO.'],
  },
};

/** He tries to grab one of them. */
export const TOO_GREASY = ['TOO GREASY!', "CAN'T GET A GRIP! HE'S GREASIER THAN A GAS STATION TAQUITO!", 'HE SLIPPED RIGHT OUT! GREASY BASTARD!'];

// ---------------------------------------------------------------------------------------------------------------
// The mean men (barks: rare, short, by the state of him)

export const GOON_BARK: ByPants = {
  clean: ['GET THE CAT!', 'HERE, KITTY KITTY! I GOT A BAT!', 'THE BOSS SAYS NO CATS!', "I'M ALLERGIC! GET IT AWAY FROM ME!"],
  shitty: ['WHO LET THE CAT SHIT IN THE EAST ROOM?', "THE CAT'S GOT A TURD STUCK IN ITS FUR!"],
  nude: [
    "THE CAT'S GOT NO PANTS! WAIT, CATS DON'T...", "WHY'S THE CAT NAKED? CATS ARE ALWAYS NAKED. WHY'S IT WEIRD?",
    "YOU'RE NOT WEARING PANTS, LIKE A NORMAL CAT, BUT I CAN STILL SEE ITS DICK.", 'WHY DOES THE CAT HAVE A DICK? WHO DREW THAT?',
  ],
};
export const GOON_RUSH = ['SIC HIM!', 'TACKLE!', 'GOTCHA!'];
export const LOBBY_BARK: ByPants = {
  clean: ['EVERY CAT HAS ITS PRICE!', "LET'S DO LUNCH! YOUR FUNERAL LUNCH!", 'THIS BRIEFCASE IS FULL OF HOOKER PHONE NUMBERS!'],
  shitty: ['I CAN MAKE THAT SMELL GO AWAY! FOR A PRICE!', "THAT'S A DIRTY CAT. I LIKE DIRTY."],
  nude: ['I CAN GET YOU SOME PANTS! FOR A CONTRIBUTION!', "I'VE PAID SENATORS TO DO WORSE THAN THAT!", 'I CAN MAKE THAT DICK GO AWAY! FOR A PRICE!'],
};
export const LOBBY_TOSS = ['CAMPAIGN CONTRIBUTION!', 'KICKBACK!', 'SPECIAL INTERESTS!'];
export const POLL_BARK: ByPants = {
  clean: ['NINE OUT OF TEN VOTERS HATE CATS!', "THE NUMBERS SAY YOU'RE DEAD! PLUS OR MINUS THREE!", "YOU'RE POLLING AT ZERO, KITTY!"],
  shitty: ['FOCUS GROUPS SAY YOU STINK!', 'YOUR FAVORABLES ARE IN THE TOILET! LITERALLY!'],
  nude: ['VOTERS DO NOT WANT A NAKED CAT!', "SIXTY PERCENT OF VOTERS SAY THAT'S SMALL!", "NINE OUT OF TEN VOTERS CAN SEE THE CAT'S DICK!"],
};
export const POLL_TOSS = ['SURVEY SAYS!', 'MARGIN OF ERROR!', 'TAKE A POLL!'];

// ---------------------------------------------------------------------------------------------------------------
// What hurts him here, and the death screens (28 characters at most)

export const HURT: HurtTable = {
  'm2:ct_goon': { hurt: ['A HENCHMAN PUNCHED ME!', 'OW! FUCKING MEAN MAN!', 'SUCKER PUNCHED BY A SUIT!'], death: ['KILLED BY A MEAN MAN', 'HENCHED'] },
  'm2:ct_lobbyist': { hurt: ['HIT WITH A BRIEFCASE!', 'HE HIT ME WITH A BRIEFCASE FULL OF BRIBES!', 'LOBBIED IN THE FACE!'], death: ['LOBBIED TO DEATH', 'BOUGHT AND PAID FOR'] },
  'm2:ct_moneybag_shot': { hurt: ['A BAG OF MONEY! IN THE FACE!', "DIRTY MONEY! IT'S STICKY!", 'HIT BY A KICKBACK!'], death: ['KILLED BY A KICKBACK', 'DIED OF DIRTY MONEY'] },
  'm2:ct_pollster': { hurt: ['THE POLLSTER HIT ME!', 'HE POLLED MY FACE!', 'SURVEYED IN THE NUTS!'], death: ['POLLED TO DEATH', 'DOWN IN THE POLLS'] },
  'm2:ct_clipboard_shot': { hurt: ['A CLIPBOARD! IN THE FACE!', 'A CLIPBOARD! IN MY CAT TEETH!', 'CLIPBOARDED!'], death: ['KILLED BY A CLIPBOARD', 'SURVEY SAYS: DEAD'] },
  'm2:ct_stinkbomb_shot': { hurt: ['A STINK BOMB! I SMELL WORSE!', "IT'S IN MY EYES! THE STINK!", 'GASSED BY A BLIMP!'], death: ['STUNK TO DEATH', 'GASSED BY A BLIMP'] },
  'm2:ct_vacuum': { hurt: ['THE VACUUM SUCKED ME IN!', 'IT SUCKED MY BALLS! THE VACUUM!', 'HOOVERED!'], death: ['VACUUMED UP', 'HOOVERED TO DEATH'] },
  'm2:ct_bowling': { hurt: ['A BOWLING BALL! MY SHINS!', 'BOWLING BALL! RIGHT IN THE NUTS!', 'BOWLED OVER!'], death: ['BOWLED OVER', 'A STRIKE. ON ME'] },
  'm2:ct_roses': { hurt: ['THORNS! IN MY ASS!', 'THE ROSES! THEY BITE!', "OW! THE FIRST LADY'S ROSES!"], death: ['KILLED BY ROSES', 'THORNED TO DEATH'] },
  'm2:ct_sprinkler': { hurt: ['WATER! I HATE WATER!', 'THE SPRINKLER GOT ME!', "I'M WET! I'M A WET CAT!"], death: ['DROWNED BY A SPRINKLER', 'WET CAT. DEAD CAT'] },
  'm2:ct_perot': { hurt: ['PEROT FLATTENED ME!', 'HIS EARS SLAPPED ME LIKE A WET TOWEL!', 'OW! THE LITTLE GUY!'], death: ['FLATTENED BY PEROT', 'DROPPED OUT OF THE RACE'] },
  'm2:ct_piechart_shot': { hurt: ['A PIE CHART! IN THE FACE!', 'THE DATA HURTS!', 'HIT BY A GRAPH!'], death: ['KILLED BY A PIE CHART', 'IT WAS JUST THAT SIMPLE'] },
  'm2:ct_falwell': { hurt: ['THE PREACHER SQUASHED ME!', "THE PREACHER SAT ON ME! HE'S MOIST!", 'SMITTEN!'], death: ['SMITTEN BY FALWELL', 'MORALLY MAJORITIED'] },
  'm2:ct_bible_shot': { hurt: ['A BIBLE! IN THE FACE!', 'A LEATHER BIBLE! RIGHT IN THE MOUTH!', 'HIT BY SCRIPTURE!'], death: ['KILLED BY A BIBLE', 'THROWN THE BOOK AT'] },
  'm2:ct_offering_shot': { hurt: ['A COLLECTION PLATE!', 'TEN PERCENT OF MY TEETH!', 'HIT BY THE OFFERING!'], death: ['TITHED TO DEATH', 'PASSED THE PLATE'] },
};

// ---------------------------------------------------------------------------------------------------------------
// The announcer's kill callouts, by kind; and his call as each pundit goes down (pundits.ts)

export const PEROT_DOWN = 'PEROT DROPS OUT!';
export const FALWELL_DOWN = 'FALWELL FALLS!';
export const KILL_CALLS: Record<string, Record<string, string[]>> = {
  'm2:ct_goon': { charge: ['HENCHED!', 'MEAN MAN DOWN!'], uppercut: ['FIRED!'], divekick: ['STOMPED OUT!'] },
  'm2:ct_lobbyist': { charge: ['LOBBIED!', 'DEREGULATED!'], uppercut: ['CASHED OUT!'], divekick: ['BRIBE DENIED!'] },
  'm2:ct_pollster': { charge: ['POLLED!', 'DOWN IN THE POLLS!'], uppercut: ['MARGIN OF ERROR!'], divekick: ['SURVEY SAYS!'] },
  'm2:ct_blimp': { charge: ['POPPED!'], uppercut: ['DEFLATED!'], divekick: ['GROUNDED!'] },
};

const pools = (b: ByPants) => allOf(b);
const punditPools = (l: PunditLines) => [...allOf(l.intro), ...allOf(l.taunt), ...l.toss, ...allOf(l.death)];
const meatPundit = (l: PunditLines) => [...allOf(l.reply), ...allOf(l.baffled), ...allOf(l.after)];
export const VOICE_LINES: Record<string, string[]> = {
  meathead: [
    ...ERASED, ...allOf(REDRAWN), ...allOf(SHUT_UP_FIRST), ...allOf(REDRAWN_AGAIN), ...allOf(SHUT_UP), ...Object.values(HINT_RETORT).flat(),
    ...Object.values(GAGS).flatMap(allOf), ...meatPundit(PEROT_LINES), ...meatPundit(FALWELL_LINES), ...TOO_GREASY,
    ...allOf(SHOW_MOCK), ...allOf(KILL_QUIP),
    ...Object.values(HURT).flatMap(h => h.hurt),
  ],
  death: Object.values(HURT).flatMap(h => h.death),
  announcer: [...new Set(Object.values(KILL_CALLS).flatMap(k => Object.values(k).flat())), PEROT_DOWN, FALWELL_DOWN],
  [CHELSEA]: [
    ...CHELSEA_INTRO, ...allOf(CHELSEA_INTRO2), ...allOf(NAG), ...Object.values(HINT).flat(), ...OUCH, ...PEROT_COMING, ...FALWELL_COMING,
    ...QUEASY_PEROT, ...QUEASY_FALWELL, ...CHEER, ...COWER,
  ],
  [PEROT]: punditPools(PEROT_LINES),
  [FALWELL]: punditPools(FALWELL_LINES),
  [MEAN_VOICES.goon]: [...pools(GOON_BARK), ...GOON_RUSH], [MEAN_VOICES.goonf]: [...pools(GOON_BARK), ...GOON_RUSH],
  [MEAN_VOICES.lobbyist]: [...pools(LOBBY_BARK), ...LOBBY_TOSS], [MEAN_VOICES.lobbyistf]: [...pools(LOBBY_BARK), ...LOBBY_TOSS],
  [MEAN_VOICES.pollster]: [...pools(POLL_BARK), ...POLL_TOSS], [MEAN_VOICES.pollsterf]: [...pools(POLL_BARK), ...POLL_TOSS],
};
