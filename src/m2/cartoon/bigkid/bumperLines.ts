// SPAZ & STINKY'S BUMPER BASH CHALLENGE: every line of it (the carny in his booth by the rink, Meathead, the
// announcer). The owner's: "there's a guy who offers you a bumper car challenge at the ticket booth. 'kill everyone, win
// a prize'." In the owner's voice: blunt, short, vulgar; clean / shitty / naked pools. Pure data (tools/voices bundles
// it in node): bigkid/lines.ts puts it in the zone's VOICE_LINES.

import { allOf, type ByPants } from '../talk';

/** The carny's voice (cast.json's churro man: gruff, a little fast). */
export const CARNY_VOICE = 'm2.cartoon.churro';

/** The owner's line: his bark as Meathead walks up (once a visit), and the end of every offer. */
export const CARNY_HOOK = 'KILL EVERYONE, WIN A PRIZE.';

/** Waving him down from the booth (now and then, while he's in sight and hasn't come over: never back to back). */
export const CARNY_CALL: ByPants = {
  clean: ['HEY! BEEFCAKE! OVER HERE!', 'YO, MUSCLES! WANNA KILL SOME PEOPLE?', 'HEY! YOU! FREE MURDER! OVER HERE!'],
  shitty: ['HEY, SHITPANTS! OVER HERE! BRING A TOWEL!', 'YO! YOU! THE ONE THAT STINKS! C\'MERE!'],
  nude: ['HEY, NAKED GUY! OVER HERE! EYES UP, EVERYBODY!', 'YO, NUDIE! COME PARK YOUR BARE ASS IN A CAR!'],
};
/** Talked to (UP): the offer. */
export const CARNY_OFFER: ByPants = {
  clean: [
    'BUMPER CAR CHALLENGE. KILL EVERYONE, WIN A PRIZE.',
    'STEP RIGHT UP, BEEFCAKE. KILL EVERYONE, WIN A PRIZE.',
    "NOBODY'S WON IN NINE YEARS. KILL EVERYONE, WIN A PRIZE.",
  ],
  shitty: [
    'YOU SMELL LIKE A PORTA-POTTY FIRE. KILL EVERYONE, WIN A PRIZE.',
    "SIT ON A TOWEL. I'M SERIOUS. KILL EVERYONE, WIN A PRIZE.",
  ],
  nude: [
    'NO PANTS, NO PROBLEM. KILL EVERYONE, WIN A PRIZE.',
    'TUCK IT UNDER THE WHEEL, PAL. KILL EVERYONE, WIN A PRIZE.',
  ],
};
/** Talked to again after a loss (or a quit), not won yet: back for more? */
export const CARNY_BACK: ByPants = {
  clean: [
    'BACK FOR MORE? SAME DEAL. KILL EVERYONE, WIN A PRIZE.',
    "YOU AGAIN? THE CLOCK DIDN'T GET ANY SLOWER. KILL EVERYONE, WIN A PRIZE.",
  ],
  shitty: [
    'BACK FOR MORE? I JUST WIPED THE SEAT. KILL EVERYONE, WIN A PRIZE.',
    'YOU AGAIN. STILL STINKING. KILL EVERYONE, WIN A PRIZE.',
  ],
  nude: [
    'BACK FOR MORE, NUDIE? KILL EVERYONE, WIN A PRIZE.',
    'STILL NAKED. STILL LOSING. KILL EVERYONE, WIN A PRIZE.',
  ],
};
/** Talked to again after he's won it (no second prize): the warning, sore about it, but it's a game, go again. */
export const CARNY_SORE: ByPants = {
  clean: [
    'NO PRIZE THIS TIME, BIG GUY. YOU ALREADY CLEANED ME OUT. WANNA GO AGAIN ANYWAY?',
    'YOU AGAIN. THERE WAS ONE PRIZE. YOU TOOK IT. PLAY FOR FREE, ASSHOLE.',
    'NO MORE PRIZES. MY BOSS DOCKED MY PAY FOR THE LAST ONE.',
    'NINE YEARS NOBODY WINS. THEN YOU. GO ON. RIDE FOR NOTHING.',
  ],
  shitty: [
    'NO PRIZE THIS TIME, STINKY. YOU ALREADY GOT IT. WANNA GO AGAIN ANYWAY?',
    'NO PRIZE. AND YOU LEFT A STAIN IN CAR SIX. GO ON.',
    "YOU WON. YOU ALSO SHAT IN MY CAR. WE'RE EVEN. RIDE FOR FREE.",
  ],
  nude: [
    'NO PRIZE THIS TIME, NUDIE. YOU ALREADY CLEANED ME OUT. WANNA GO AGAIN ANYWAY?',
    "NO PRIZE. I'M STILL SCRUBBING THE SEAT YOUR BALLS WERE ON.",
    'NO MORE PRIZES, NUDIST. RIDE FOR FREE. KEEP IT IN THE CAR.',
  ],
};
/** He backed out at the box. */
export const CARNY_DECLINE: ByPants = {
  clean: ['PUSSY.', 'SURE. THE TEACUPS ARE THAT WAY.', "THAT'S WHAT THEY ALL SAY."],
  shitty: ["GOOD. YOU'D RUIN THE UPHOLSTERY.", 'PROBABLY SMART. THE SEATS DON\'T COME OUT.'],
  nude: ['PROBABLY BEST. THE SEATS ARE VINYL.', "GOOD. NOBODY WANTS TO SIT WHERE YOU'VE SAT."],
};
/** Time's up: the clock beat him. (Then he's back out at the booth: again's his to ask for.) */
export const CARNY_LOSE: ByPants = {
  clean: ["TIME! THAT'S WHY NOBODY WINS.", 'TIME! THE HOUSE ALWAYS WINS.', "TIME'S UP, CHAMP. GET OUT OF MY CAR."],
  shitty: ['TIME! YOU STUNK UP THE CAR FOR NOTHING.', 'TIME! AND NOW CAR SIX SMELLS.'],
  nude: ["TIME! YOU LOST AND YOU'RE NAKED. ROUGH DAY.", 'TIME! NOW GO PUT SOMETHING ON.'],
};
/** He won the first time: the carny's face falls. Sore. */
export const CARNY_WIN: ByPants = {
  clean: ['WHAT? NOBODY WINS THIS. THE CARS ARE RIGGED. I RIGGED THEM.', 'GREAT. YOU KILLED EVERYONE. NOW I GOTTA FILL OUT TWELVE FORMS.'],
  shitty: ['YOU WON. TAKE THE PRIZE AND GET YOUR ASS OUT OF MY CAR.', 'NINE YEARS. AND THE GUY WHO WINS SHAT HIMSELF.'],
  nude: ['A NAKED GUY WON. I QUIT. AFTER I GIVE YOU THIS.', "YOU WON. DON'T STAND UP. PLEASE DON'T STAND UP."],
};
/** Handing it over (the first win only). */
export const CARNY_PRIZE = ["FINE. HERE. A CHARGE SHARD. DON'T ASK ME WHAT IT DOES.", "HERE. A CHARGE SHARD. IT'S ALL WE GOT. I WAS GONNA PAWN IT."];
/** He won again (no prize): sore as ever. */
export const CARNY_WIN_AGAIN: ByPants = {
  clean: ["YEAH, YEAH. YOU'RE VERY GOOD AT MURDER. NO PRIZE.", 'GREAT. MORE FORMS. GET OUT OF MY CAR.'],
  shitty: ['YOU WON AGAIN. THE CAR LOST AGAIN. GET OUT.', "NO PRIZE. JUST THE SMELL. THAT'S MINE NOW."],
  nude: ['NO PRIZE. PUT IT AWAY AND GET OUT.', 'CONGRATULATIONS. NOW GET YOUR BARE ASS OFF MY SEAT.'],
};

// ---------------------------------------------------------------------------------------------------------------
// Meathead

/** The offer made: his take on it (then the box). */
export const MH_OFFERED: ByPants = {
  clean: ["BUMPER CARS DON'T GO HIGH. BUT THEY GO INTO PEOPLE.", 'A RIDE WITH A BODY COUNT? NOW YOU\'RE TALKING.', 'KILLING AND A PRIZE? FINALLY A RIDE WITH A POINT.'],
  shitty: ["I'LL SIT IN IT. YOU HOSE IT OUT.", 'KILLING TAKES MY MIND OFF THE PANTS.'],
  nude: ["THAT SEAT'S GONNA BE COLD ON THE BALLS. WORTH IT.", "I'LL DRIVE NAKED. THE SEAT'S YOUR PROBLEM."],
};
/** The flag drops. */
export const MH_START: ByPants = {
  clean: ['GENTLEMEN, START YOUR PUSSY CARS.', 'NO TRACK. NO HILL. JUST VICTIMS.'],
  shitty: ['EVERYBODY STAY DOWNWIND.', "LET'S DO THIS BEFORE IT SOAKS THROUGH."],
  nude: ['NAKED AND IN A BUMPER CAR. MOM WOULD BE SO PROUD.', 'MY BALLS ARE ON THE VINYL. LET\'S GO.'],
};
/** A boosted ram sends one flying. */
export const MH_KILL: ByPants = {
  clean: ['BUMPED OFF!', 'NEXT!', "THAT'S A PANCAKE.", 'ENJOY THE RIDE, PUSSY!', 'TICKET PUNCHED!'],
  shitty: ['SMELL THAT? THAT\'S VICTORY. AND ME.', 'FLY AWAY FROM THE SMELL!', 'NEXT! HOLD YOUR NOSE!'],
  nude: ['MY BALLS ARE IN THE WIND, AND YOU\'RE IN THE AIR!', 'NEXT! EYES UP HERE!', 'FLY, NAKED-HATER!'],
};
/** He drove over a flattened one anyway. */
export const MH_OVERKILL: ByPants = {
  clean: ['AND STAY DOWN.', 'ONE MORE FOR THE ROAD.', 'SPEED BUMP.'],
  shitty: ['NOW YOU SMELL LIKE ME.', 'SPEED BUMP. SQUISHY ONE.'],
  nude: ['TEABAGGED BY A BUMPER CAR.', 'SPEED BUMP. LIKE MY CHEST.'],
};
/** Rammed hard. */
export const MH_RAMMED: ByPants = {
  clean: ['HEY! MY NECK!', 'WHO TAUGHT YOU TO DRIVE?', 'OH, IT IS ON NOW.'],
  shitty: ["DON'T HIT ME! IT SLOSHES!", 'EASY! IT GOES UP MY BACK!'],
  nude: ['MY NUTS HIT THE WHEEL!', 'OW! THE VINYL! IT PINCHED!'],
};
/** Time's up. */
export const MH_LOSE: ByPants = {
  clean: ['THE CLOCK CHEATED.', "THE STEERING'S BROKEN. IT'S A BUMPER CAR. THEY'RE ALL BROKEN."],
  shitty: ['I WAS DISTRACTED. BY MY PANTS.', 'THE CAR STALLED. IT WAS THE SMELL.'],
  nude: ['IT WAS THE DRAFT. I COULDN\'T STEER WITH THE DRAFT.', 'MY BALLS STUCK TO THE SEAT. I DEMAND A RECOUNT.'],
};
/** Everybody's dead. */
export const MH_WIN: ByPants = {
  clean: ["EVERYBODY'S DEAD. GIMME MY PRIZE.", 'BUMPER CARS. NOW THAT\'S A RIDE.'],
  shitty: ['I WON. YOU CAN KEEP THE SEAT.', 'EVERYBODY\'S DEAD. AND I STILL SMELL WORSE.'],
  nude: ['I WON NAKED. PUT THAT ON THE SIGN.', 'EVERYBODY\'S DEAD. NOBODY SAW NOTHING.'],
};

/** The announcer's. */
export const OVERKILL_CALL = 'OVERKILL!';

const all = (...r: ByPants[]) => r.flatMap(allOf);
/** By voice, for bigkid/lines.ts's VOICE_LINES. */
export const BUMPER_VOICE_LINES: Record<string, string[]> = {
  meathead: all(MH_OFFERED, MH_START, MH_KILL, MH_OVERKILL, MH_RAMMED, MH_LOSE, MH_WIN),
  [CARNY_VOICE]: [CARNY_HOOK, ...all(CARNY_CALL, CARNY_OFFER, CARNY_BACK, CARNY_SORE, CARNY_DECLINE, CARNY_LOSE, CARNY_WIN, CARNY_WIN_AGAIN), ...CARNY_PRIZE],
  announcer: [OVERKILL_CALL],
};
