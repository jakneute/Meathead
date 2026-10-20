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
  clean: ["I'M A CAT. I'M A FUCKING CAT.", 'I HAVE A TAIL. WHY DO I HAVE A TAIL?'],
  shitty: ["I'M A CAT. I STILL SHIT MYSELF. GREAT.", "THEY DREW ME A TAIL. THEY DIDN'T DRAW ME CLEAN PANTS."],
  nude: ["I'M A NAKED CAT. THAT'S JUST A CAT.", 'THEY DREW ME FUR. NOWHERE USEFUL.'],
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
  clean: ['SHUT UP.'],
  shitty: ['SHUT UP. IT WAS ME.'],
  nude: ['SHUT UP. CATS DON\'T WEAR PANTS.'],
};
/** Back in later (been redrawn before): a quick scribble back into the cat, his line. */
export const REDRAWN_AGAIN: ByPants = {
  clean: ['AGAIN WITH THE CAT.', 'BACK TO BEING A CAT. SURE.'],
  shitty: ['A CAT AGAIN. A SHITTY CAT.', 'CAT AGAIN. SAME PANTS.'],
  nude: ['NAKED CAT. AGAIN.', 'BACK TO THE FUR. STILL NO PANTS.'],
};

// ---------------------------------------------------------------------------------------------------------------
// Chelsea, nagging

/** Every so often, wherever (talk less: she does enough for both of them). */
export const NAG: ByPants = {
  clean: [
    'SOCKS! THIS WAY!', 'HEY! HEY, SOCKS! THE MEAN MEN WENT THIS WAY!', "SOCKS, YOU'RE SUPPOSED TO BE HELPING!",
    'DAD SAYS A GOOD CAT NEVER GIVES UP!', "COME ON, SOCKS! AMERICA'S COUNTING ON US!", 'SOCKS! SOCKS! SOCKS! SOCKS!',
    "MOM SAYS IT TAKES A VILLAGE! YOU'RE THE VILLAGE, SOCKS!",
  ],
  shitty: ['SOCKS, DID YOU GO IN THE HOUSE AGAIN?', 'EW, SOCKS! SOMEBODY GET THE LITTER BOX!', "SOCKS, YOU SMELL LIKE THE PRESS ROOM!"],
  nude: ['SOCKS! WHERE DID YOUR PANTS GO?', "CATS DON'T WEAR PANTS ANYWAY! I THINK!", "SOCKS, PUT SOMETHING ON! THE PRESS IS WATCHING!"],
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
export const OUCH = ['SOCKS! ARE YOU OKAY?', 'BAD MAN! YOU HURT SOCKS!', 'SOCKS, NO! GET UP!'];
/** He tells her to shut up (after about every other nag). */
export const SHUT_UP: ByPants = {
  clean: ['SHUT UP.', 'SHUT UP, KID.', "I'M NOT YOUR CAT.", 'NOBODY ASKED YOU.', 'SHUT. UP.'],
  shitty: ['SHUT UP. I KNOW. I SMELL IT TOO.', 'SHUT UP ABOUT THE LITTER BOX.', 'SHUT UP OR YOU GET HUGGED.'],
  nude: ['SHUT UP AND STOP LOOKING.', "SHUT UP. YOU SAID CATS DON'T WEAR PANTS.", 'SHUT UP. EYES UP HERE.'],
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
    clean: ["I'M SPITTING HAIRBALLS. THAT'S MY GUN NOW.", 'THEY TOOK MY GUN AND GAVE ME A HAIRBALL.'],
    shitty: ['HAIRBALLS OUT THE FRONT. YOU KNOW WHAT OUT THE BACK.', 'EVERYTHING ON ME LEAKS NOW.'],
    nude: ['NAKED AND COUGHING UP HAIR. LIVING THE DREAM.', 'I SPIT HAIRBALLS NOW. I HAVE NO PANTS. GREAT DAY.'],
  },
  vacuum: {
    clean: ['A VACUUM WITH NOBODY PUSHING IT. SURE. CARTOONS.', "IT'S A HOOVER. IT WANTS ME."],
    shitty: ['THAT VACUUM IS NOT CLEANING THIS UP.', "SUCK THIS UP? YOU DON'T WANT IT."],
    nude: ["DON'T SUCK ON ANYTHING, VACUUM.", "KEEP THAT HOSE AWAY FROM MY BALLS."],
  },
  wax: {
    clean: ['THE FLOOR IS GREASED. OF COURSE IT IS.', 'SLIPPERY. LIKE A WATER PARK WITHOUT THE PARK.'],
    shitty: ['SLIPPERY FLOOR. SLIPPERY PANTS. BAD COMBO.', 'IF I GO DOWN, I GO DOWN IN IT.'],
    nude: ['SLIDING ON A FLOOR NAKED. THAT BURNS.', 'BARE ASS ON A WAXED FLOOR. FRICTION.'],
  },
  chandelier: {
    clean: ['RIDING A CHANDELIER. BEST RIDE IN THE PARK SO FAR.', 'NOW THIS IS A RIDE.'],
    shitty: ["DON'T LOOK UP, EVERYBODY.", 'SWINGING. SOMETHING ELSE IS SWINGING TOO.'],
    nude: ['SWINGING NAKED FROM A CHANDELIER. LIKE COLLEGE.', 'EVERYTHING IS SWINGING NOW.'],
  },
  stairs: {
    clean: ['BOWLING BALLS DOWN THE STAIRS. FINALLY SOMETHING FUN.', "THEY'RE BOWLING AT ME. AT A CAT."],
    shitty: ['A BALL TO THE GUT AND I PAINT THESE STAIRS.', 'DO NOT HIT ME IN THE STOMACH.'],
    nude: ['TWO BALLS COMING DOWN, TWO BALLS DANGLING UP HERE.', "DON'T HIT THE PINS. MY PINS."],
  },
  garden: {
    clean: ['OUTSIDE. STILL A CARTOON. STILL A CAT.', 'A ROSE GARDEN. NOBODY PISS ON ANYTHING. EXCEPT ME.'],
    shitty: ["FRESH AIR. DOESN'T HELP.", 'MAYBE I CAN BURY IT LIKE A CAT.'],
    nude: ['NAKED IN THE ROSE GARDEN. WATCH THE THORNS.', 'A CAT IN THE GARDEN. NAKED. NATURE.'],
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
    clean: ['WHO THE HELL ARE YOU?', 'WHO?'],
    shitty: ["I DON'T KNOW WHO YOU ARE, AND I SHIT MYSELF.", "WHO? AND DON'T SMELL ME."],
    nude: ['WHO? AND STOP LOOKING AT IT.', "I DON'T KNOW YOU. YOU'VE SEEN MY DICK."],
  },
  taunt: {
    clean: [
    "YOU HEAR THAT, KITTY? THAT'S A GIANT SUCKING SOUND!", "NOW WATCH CLOSE. THIS HERE'S A PIE CHART!", "IT'S JUST THAT SIMPLE!",
    'THE DEFICIT IS AS BIG AS MY EARS!', 'NOW LET ME FINISH! LET ME FINISH!', "I'M BUYIN' THIS WHOLE WHITE HOUSE! CASH!",
    "THAT'S A JOB GOIN' SOUTH, SON!", "GET UNDER THE HOOD AND FIX IT! THAT'S ALL IT IS!",
    ],
    shitty: ['WHEW! THAT SMELL IS GOIN\' SOUTH OF THE BORDER, SON!', 'THAT SMELL IS A GIANT SUCKING SOUND!'],
    nude: ["SON, PUT IT IN A BLIND TRUST!", "I'M ALL EARS, KITTY! NOT ALL EYES! PUT IT AWAY!"],
  },
  toss: ['PIE CHART!', 'HERE COMES THE DATA!', 'CHART THIS!', 'GRAPHS!'],
  baffled: {
    clean: ["WHAT'S A NAFTA?", 'WHAT IS HE TALKING ABOUT?', 'WHY ARE HIS EARS SO BIG?', 'WHAT KID WATCHES THIS?'],
    shitty: ["I DON'T KNOW WHAT A NAFTA IS. I KNOW WHAT A SHART IS.", 'GIANT SUCKING SOUND. THAT WAS MY PANTS.'],
    nude: ['WHO GIVES A NAKED CAT A PIE CHART?', "I DON'T KNOW YOU AND YOU KEEP LOOKING DOWN."],
  },
  death: {
    clean: ["WELL, THAT'S JUST SAD! I'M DROPPIN' OUT OF THE RACE!"],
    shitty: ["WELL, THAT'S JUST SAD! AND STINKY! I'M DROPPIN' OUT!"],
    nude: ["WELL, THAT'S JUST SAD! AND NAKED! I'M DROPPIN' OUT!"],
  },
  after: {
    clean: ["I STILL DON'T KNOW WHO THAT WAS.", 'WHAT PSYCHO KID WATCHES THIS?'],
    shitty: ['NO IDEA WHO THAT WAS. NEED NEW PANTS.', 'WHOEVER HE WAS, HE SMELLED ME.'],
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
    clean: ['WHO THE HELL ARE THESE PEOPLE?', 'WHAT?'],
    shitty: ["I DON'T KNOW WHO YOU ARE. I'M THE SIN? FINE.", 'WHO? AND WHAT DID I DO? BESIDES THIS.'],
    nude: ['WHO? AND WHY IS EVERYBODY LOOKING DOWN?', "I DON'T KNOW YOU, PREACHER. EYES UP."],
  },
  taunt: {
    clean: [
      'THE GAY AGENDA IS COMING FOR OUR CARTOONS! NOT ON MY WATCH!', 'TWO DADDIES? NOT IN THIS HOUSE, KITTY!',
      "REPENT! YOUR SOUL'S AS BLACK AS YOUR FUR!", "I'M PRAYING FOR YOU! AT YOU! I'M PRAYING AT YOU!",
      'THE MORAL MAJORITY HAS SPOKEN!', 'PASS THE COLLECTION PLATE! DIG DEEP, SINNER!', 'THIS IS A CHRISTIAN NATION, KITTY!',
      'SECULAR HUMANISM! IN THE WHITE HOUSE!',
    ],
    shitty: ['THE STENCH OF SIN! IT FILLS THE LINCOLN BEDROOM!', 'BRIMSTONE! I SMELL BRIMSTONE! OH, IT\'S YOU.'],
    nude: ['COVER YOUR SHAME, KITTY! COVER IT WITH THIS BIBLE!', 'NAKED AS THE DAY SATAN MADE YOU!'],
  },
  toss: ['HAVE A BIBLE!', 'COLLECTION PLATE!', 'TITHE!', 'THE GOOD BOOK!'],
  baffled: {
    clean: ['WHAT AGENDA? WHO THE HELL ARE YOU?', 'WHAT KIND OF PSYCHO KID WATCHES THIS?', 'WHY IS THIS A CARTOON?', 'IS THIS A KIDS SHOW? FOR WHAT KIDS?'],
    shitty: ['I SMELL LIKE SIN. FINE. WHO ARE YOU?', 'HE KEEPS SAYING SIN. HE MEANS MY PANTS.'],
    nude: ['HE KEEPS SAYING SODOM. I THINK THATS A COMPLIMENT.', 'STOP PRAYING AT MY DICK.'],
  },
  death: {
    clean: ['CURSES! THE MORAL MAJORITY WILL REMEMBER THIS, KITTY!'],
    shitty: ['CURSES! SMITTEN BY A STINKY CAT! THE MORAL MAJORITY WILL REMEMBER THIS!'],
    nude: ['CURSES! STRUCK DOWN BY A NAKED CAT! IN THE LINCOLN BEDROOM!'],
  },
  after: {
    clean: ['WHO THE HELL ARE THESE PEOPLE?', 'WHAT PSYCHO KID WATCHED THIS SHOW?'],
    shitty: ["GONE. STILL DON'T KNOW HIM. STILL SHITTY.", "HE CALLED ME SIN. HE WASN'T WRONG."],
    nude: ['GONE. HE PRAYED AT MY DICK THE WHOLE TIME.', 'NAKED CAT ONE, PREACHER ZERO.'],
  },
};

/** He tries to grab one of them. */
export const TOO_GREASY = ['TOO GREASY!', "CAN'T GET A GRIP! HE'S ALL GREASE!", 'HE SLIPPED RIGHT OUT! GREASY BASTARD!'];

// ---------------------------------------------------------------------------------------------------------------
// The mean men (barks: rare, short, by the state of him)

export const GOON_BARK: ByPants = {
  clean: ['GET THE CAT!', 'HERE, KITTY KITTY!', 'THE BOSS SAYS NO CATS!', "I'M ALLERGIC! GET IT AWAY FROM ME!"],
  shitty: ['WHO LET THE CAT GO IN THE HALLWAY?', 'SOMEBODY CHANGE THE LITTER!'],
  nude: ["THE CAT'S GOT NO PANTS! WAIT, CATS DON'T...", "WHY'S THE CAT NAKED? CATS ARE ALWAYS NAKED. WHY'S IT WEIRD?"],
};
export const GOON_RUSH = ['SIC HIM!', 'TACKLE!', 'GOTCHA!'];
export const LOBBY_BARK: ByPants = {
  clean: ['EVERY CAT HAS ITS PRICE!', "LET'S DO LUNCH! YOUR FUNERAL LUNCH!", 'THIS BRIEFCASE IS FULL OF INFLUENCE!'],
  shitty: ['I CAN MAKE THAT SMELL GO AWAY! FOR A PRICE!', "THAT'S A DIRTY CAT. I LIKE DIRTY."],
  nude: ['I CAN GET YOU SOME PANTS! FOR A CONTRIBUTION!', 'NAKED AND UNLOBBIED! A SHAME!'],
};
export const LOBBY_TOSS = ['CAMPAIGN CONTRIBUTION!', 'KICKBACK!', 'SPECIAL INTERESTS!'];
export const POLL_BARK: ByPants = {
  clean: ['NINE OUT OF TEN VOTERS HATE CATS!', 'THE NUMBERS SAY YOU\'RE DEAD!', "YOU'RE POLLING AT ZERO, KITTY!"],
  shitty: ['FOCUS GROUPS SAY YOU STINK!', 'YOUR APPROVAL RATING SMELLS!'],
  nude: ['VOTERS DO NOT WANT A NAKED CAT!', 'THE PEOPLE HAVE SPOKEN! PUT IT AWAY!'],
};
export const POLL_TOSS = ['SURVEY SAYS!', 'MARGIN OF ERROR!', 'TAKE A POLL!'];

// ---------------------------------------------------------------------------------------------------------------
// What hurts him here, and the death screens (28 characters at most)

export const HURT: HurtTable = {
  'm2:ct_goon': { hurt: ['A HENCHMAN PUNCHED ME!', 'OW! MEAN MAN!', 'SUCKER PUNCHED BY A SUIT!'], death: ['KILLED BY A MEAN MAN', 'HENCHED'] },
  'm2:ct_lobbyist': { hurt: ['HIT WITH A BRIEFCASE!', 'OW! SPECIAL INTERESTS!', 'LOBBIED IN THE FACE!'], death: ['LOBBIED TO DEATH', 'BOUGHT AND PAID FOR'] },
  'm2:ct_moneybag_shot': { hurt: ['A BAG OF MONEY! IN THE FACE!', 'OW! DIRTY MONEY!', 'HIT BY A KICKBACK!'], death: ['KILLED BY A KICKBACK', 'DIED OF DIRTY MONEY'] },
  'm2:ct_pollster': { hurt: ['THE POLLSTER HIT ME!', 'OW! MARGIN OF ERROR!', 'SURVEYED IN THE NUTS!'], death: ['POLLED TO DEATH', 'DOWN IN THE POLLS'] },
  'm2:ct_clipboard_shot': { hurt: ['A CLIPBOARD! IN THE FACE!', 'OW! SURVEY SAYS OW!', 'CLIPBOARDED!'], death: ['KILLED BY A CLIPBOARD', 'SURVEY SAYS: DEAD'] },
  'm2:ct_stinkbomb_shot': { hurt: ['A STINK BOMB! I SMELL WORSE!', "IT'S IN MY EYES! THE STINK!", 'GASSED BY A BLIMP!'], death: ['STUNK TO DEATH', 'GASSED BY A BLIMP'] },
  'm2:ct_vacuum': { hurt: ['THE VACUUM SUCKED ME IN!', 'MY FUR! IT GOT MY FUR!', 'HOOVERED!'], death: ['VACUUMED UP', 'HOOVERED TO DEATH'] },
  'm2:ct_bowling': { hurt: ['A BOWLING BALL! MY SHINS!', 'STRIKE! ME! OW!', 'BOWLED OVER!'], death: ['BOWLED OVER', 'A STRIKE. ON ME'] },
  'm2:ct_roses': { hurt: ['THORNS! IN MY ASS!', 'THE ROSES! THEY BITE!', 'OW! POINTY FLOWERS!'], death: ['KILLED BY ROSES', 'THORNED TO DEATH'] },
  'm2:ct_sprinkler': { hurt: ['WATER! I HATE WATER!', 'THE SPRINKLER GOT ME!', "I'M WET! I'M A WET CAT!"], death: ['DROWNED BY A SPRINKLER', 'WET CAT. DEAD CAT'] },
  'm2:ct_perot': { hurt: ['PEROT FLATTENED ME!', 'HIS EARS SMACKED ME!', 'OW! THE LITTLE GUY!'], death: ['FLATTENED BY PEROT', 'DROPPED OUT OF THE RACE'] },
  'm2:ct_piechart_shot': { hurt: ['A PIE CHART! IN THE FACE!', 'OW! THE DATA!', 'HIT BY A GRAPH!'], death: ['KILLED BY A PIE CHART', 'IT WAS JUST THAT SIMPLE'] },
  'm2:ct_falwell': { hurt: ['THE PREACHER SQUASHED ME!', 'OW! MORAL MAJORITY!', 'SMITTEN!'], death: ['SMITTEN BY FALWELL', 'MORALLY MAJORITIED'] },
  'm2:ct_bible_shot': { hurt: ['A BIBLE! IN THE FACE!', 'OW! THE GOOD BOOK!', 'HIT BY SCRIPTURE!'], death: ['KILLED BY A BIBLE', 'THROWN THE BOOK AT'] },
  'm2:ct_offering_shot': { hurt: ['A COLLECTION PLATE!', 'OW! TITHED!', 'HIT BY THE OFFERING!'], death: ['TITHED TO DEATH', 'PASSED THE PLATE'] },
};

// ---------------------------------------------------------------------------------------------------------------
// The announcer's kill callouts, by kind

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
    ...ERASED, ...allOf(REDRAWN), ...allOf(SHUT_UP_FIRST), ...allOf(REDRAWN_AGAIN), ...allOf(SHUT_UP),
    ...Object.values(GAGS).flatMap(allOf), ...meatPundit(PEROT_LINES), ...meatPundit(FALWELL_LINES), ...TOO_GREASY,
    ...Object.values(HURT).flatMap(h => h.hurt),
  ],
  death: Object.values(HURT).flatMap(h => h.death),
  announcer: [...new Set(Object.values(KILL_CALLS).flatMap(k => Object.values(k).flat()))],
  [CHELSEA]: [
    ...CHELSEA_INTRO, ...allOf(CHELSEA_INTRO2), ...allOf(NAG), ...Object.values(HINT).flat(), ...OUCH, ...PEROT_COMING, ...FALWELL_COMING,
    ...QUEASY_PEROT, ...QUEASY_FALWELL,
  ],
  [PEROT]: punditPools(PEROT_LINES),
  [FALWELL]: punditPools(FALWELL_LINES),
  [MEAN_VOICES.goon]: [...pools(GOON_BARK), ...GOON_RUSH], [MEAN_VOICES.goonf]: [...pools(GOON_BARK), ...GOON_RUSH],
  [MEAN_VOICES.lobbyist]: [...pools(LOBBY_BARK), ...LOBBY_TOSS], [MEAN_VOICES.lobbyistf]: [...pools(LOBBY_BARK), ...LOBBY_TOSS],
  [MEAN_VOICES.pollster]: [...pools(POLL_BARK), ...POLL_TOSS], [MEAN_VOICES.pollsterf]: [...pools(POLL_BARK), ...POLL_TOSS],
};
