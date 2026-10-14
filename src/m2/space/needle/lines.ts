// What's said in the needle section, by voice (recorded with the rest: space/voices.ts gathers these; tools/voices). In
// the user's voice (space-spec.md); pick lines with pickLine; clean / shitty / naked pools where people react to him.

/** The needle's recorded announcer: a calm, smooth woman, the airline kind, saying terrible things calmly. */
export const PA = 'm2.space.needle';
/** The passengers (a woman's voice, a man's: which by who's saying it). */
export const GUEST_F = 'm2.guest', GUEST_M = 'm2.guest2';

export interface ByPants { clean: string[]; shitty: string[]; nude: string[] }

// ---------------------------------------------------------------------------------------------------------------
// The lobby, the ride up

/** In at the bottom, the first time (him, at the sign). */
export const MH_LOBBY = [
  'SPACE NEEDLE TWO. WHAT HAPPENED TO THE FIRST ONE?',
  'A TOWER. GREAT. I LOVE A TOWER.',
  'TALLEST THING IN THE PARK. BET IT SUCKS.',
  "NO LINE. THAT'S NEVER GOOD.",
  'IT GOES TO SPACE AND NOBODY CARES. SOUNDS RIGHT.',
];
/** The lift's going up (the announcer, the doors shut). */
export const PA_UP = [
  'WELCOME ABOARD SPACE NEEDLE TWO. THE TRIP TO SPACE TAKES NINE SECONDS. PLEASE DO NOT SCREAM.',
  'WELCOME TO SPACE NEEDLE TWO. YOUR EARS WILL POP. THEN THEY WILL STOP WORKING.',
  'PLEASE HOLD THE HANDRAIL. THE HANDRAIL IS DECORATIVE.',
];
/** Going up (him, bored stiff). */
export const MH_UP = [
  "IT'S AN ELEVATOR. I'VE BEEN IN AN ELEVATOR.",
  'CLOUDS. WOW. I HAVE SEEN CLOUDS.',
  'THE ONE AT THE DMV HAS MUSIC AT LEAST.',
  'WAKE ME UP WHEN SOMETHING HAPPENS.',
];
/** Out of the air, at the top (the announcer). */
export const PA_SPACE = [
  'YOU ARE NOW SIXTY-TWO MILES UP. THIS IS SPACE. PLEASE DO NOT ASK HOW.',
  'WELCOME TO OUTER SPACE. THE GIFT CART IS TO YOUR LEFT.',
  'YOU HAVE ARRIVED IN SPACE. PLEASE DO NOT LICK THE WINDOWS.',
];
/** The doors open on it (him). */
export const MH_SPACE = [
  "SPACE. IT'S DARK. GOOD JOB.",
  "THAT'S IT? IT'S JUST NIGHTTIME.",
  "I'VE SEEN THIS. IT WAS ON A PLACEMAT.",
];

// ---------------------------------------------------------------------------------------------------------------
// The deck

/** Out onto the deck, the first time (the announcer, then him). */
export const PA_DECK = [
  'THE OBSERVATION DECK TURNS ONCE EVERY FORTY-FIVE MINUTES. THAT IS THE WHOLE RIDE. ENJOY.',
];
export const MH_DECK = [
  "IT SPINS. THAT'S IT? IT'S A LAZY SUSAN WITH A GIFT CART.",
  'I PAID TO WATCH A ROOM TURN AROUND.',
  'MY DRYER DOES THIS. FOR FREE.',
];
/** Every so often, walking round it (him). */
export const MH_BORED = [
  'BORING.',
  'THIS IS WHAT OLD PEOPLE DO ON VACATION.',
  "MY GRANDMA'S ROCKING CHAIR DOES MORE THAN THIS.",
  "I'M GONNA FALL ASLEEP STANDING UP.",
  'OH LOOK. THE EARTH. AGAIN.',
  "I'VE HAD MORE FUN AT THE DENTIST.",
  'SOMEBODY DO SOMETHING STUPID. PLEASE.',
  "IT'S A REVOLVING RESTAURANT WITH NO FOOD.",
];
/** The announcer, now and then. */
export const PA_IDLE = [
  'PLEASE DO NOT TAP THE GLASS. THERE IS NO AIR ON THE OTHER SIDE OF IT.',
  'THE WINDOWS ARE RATED FOR SIXTY POUNDS. PLEASE DO NOT LEAN ON, CHARGE, OR TACKLE THE WINDOWS.',
  'THE ASTRONAUT SUIT ON DISPLAY IS REAL. PLEASE STOP TRYING IT ON.',
  'THE GIFT CART IS OUT OF ASTRONAUT ICE CREAM. IT WAS NEVER ICE CREAM.',
  'IF YOU FEEL DIZZY, THAT IS SPACE. IT IS NORMAL. PROBABLY.',
  'THE RESTROOMS ARE CLOSED. BECAUSE OF SPACE.',
  'SPACE NEEDLE TWO THANKS ALL FIVE OF YOU FOR RIDING TODAY. A NEW RECORD.',
  'REMEMBER, SPACE NEEDLE TWO IS THE ONLY OBSERVATION DECK IN SPACE. PLEASE TELL YOUR FRIENDS. PLEASE.',
  'THE WAIT FOR SPACE NEEDLE TWO IS CURRENTLY ZERO MINUTES. IT IS ALWAYS ZERO MINUTES.',
];
/** The passengers, chatting (to each other, not to him). */
export const GUEST_VIEW = [
  "LOOK, HONEY. THAT'S OHIO.",
  "I CAN SEE OUR HOUSE. NO WAIT, THAT'S CANADA.",
  "MY EARS NEVER POPPED. I THINK THEY BURST.",
  'FORTY DOLLARS TO WATCH THE ROOM TURN.',
  'IS THE MOON SUPPOSED TO BE THAT CLOSE?',
  'THIS IS SO RELAXING.',
  "I LEFT THE KIDS IN THE CAR. IT'S FINE.",
  "WE CAME FOR THE AIR CONDITIONING.",
  'IT GOES TO SPACE AND THERE WAS NO LINE. WEIRD.',
  "THE KIDS WANTED THE ROLLER COASTER. TOO BAD.",
  "SAME VIEW AS LAST YEAR. STILL SPACE.",
];
/** Him walking right up on one of them. */
export const GUEST_REACT: ByPants = {
  clean: ['EXCUSE YOU.', "YOU'RE BLOCKING THE EARTH.", "SIR, THERE'S A LINE FOR THE WINDOW."],
  shitty: ["OH GOD. THE AIR UP HERE DOESN'T GO ANYWHERE.", 'SOMEBODY CRACK A WINDOW. NO. DO NOT.', "IT'S RECYCLED AIR, SIR. WE'RE ALL BREATHING THAT."],
  nude: ["THERE'S A NAKED MAN IN SPACE.", "HONEY, DON'T LOOK AT HIM. LOOK AT THE EARTH.", 'SIR, YOUR THING IS IN MY VIEW.'],
};

// ---------------------------------------------------------------------------------------------------------------
// The suit

/** Him, getting into it. */
export const MH_SUIT: ByPants = {
  clean: ['FINALLY. A SOUVENIR.', "IT FITS. THAT MEANS IT'S MINE."],
  shitty: ['THIS THING HAS A DIAPER BUILT IN. ABOUT TIME.', 'SPACE DIAPER. I WAS BORN FOR THIS.'],
  nude: ['BREEZY IN HERE.', 'NOTHING ON UNDER IT. JUST LIKE THE ASTRONAUTS.'],
};
/** One of the passengers, watching him take it. */
export const GUEST_SUIT: ByPants = {
  clean: ["HE'S STEALING THE ASTRONAUT SUIT!", "SIR, THAT'S A MUSEUM PIECE!"],
  shitty: ["HE'S WEARING IT OVER THE SHIT!", 'THAT SUIT WENT TO THE MOON. NOW IT HAS THAT IN IT.'],
  nude: ["HE'S PUTTING IT ON WITH NO PANTS!", 'THAT SUIT WAS ON THE MOON! NOW HIS BALLS ARE IN IT!'],
};
/** The announcer, after. */
export const PA_SUIT: ByPants = {
  clean: ['SIR. PUT THE SUIT BACK.', 'SIR. THAT SUIT IS ON LOAN.'],
  shitty: ['SIR. YOU MAY KEEP THE SUIT.', 'SIR. THAT SUIT CANNOT COME BACK NOW.'],
  nude: ['SIR. THAT SUIT HAD NO UNDERWEAR IN IT. NOW IT HAS YOU.', 'SIR. PLEASE GET YOUR BARE ASS OUT OF HISTORY.'],
};
/** Up at the case again with it on him (him). */
export const MH_CASE_EMPTY = ["I'M WEARING IT, GENIUS.", "NOTHING ELSE IN THERE. I CHECKED."];

// ---------------------------------------------------------------------------------------------------------------
// The window, and out of it

/** Up against the big window the first time (him). */
export const MH_WINDOW = ['THAT GLASS LOOKS CHEAP.', 'SIXTY POUNDS. I WEIGH TWO-FORTY.', "WHAT'S HOLDING THIS IN? TAPE?"];
/** The window's gone (the announcer, calm). */
export const PA_BREACH = [
  'ATTENTION. THE WINDOW IS GONE. PLEASE HOLD YOUR BREATH FOREVER.',
  'ATTENTION GUESTS. WE ARE EXPERIENCING SPACE. PLEASE EXIT THROUGH THE WINDOW.',
  'ATTENTION. THE DECK IS NOW EMPTYING. THANK YOU FOR VISITING SPACE NEEDLE TWO.',
];
/** Hanging onto the frame with nothing on (him). */
export const MH_SUCKED = ['OH SHIT. AIR!', 'WRONG WINDOW!', 'I NEEDED THAT AIR!', 'NOT THE GOOD KIND OF SUCKING!'];
/** ...with the suit on. */
export const MH_SUCKED_SUIT = ['FINALLY SOMETHING HAPPENS!', 'NOW THE RIDE STARTS!', 'SEE YA, NERDS!'];
/** The passengers, going out of it. */
export const GUEST_SCREAM = ['AAAAAH!', 'MY TOUPEE!', 'NOT LIKE THIS!', 'I WANT A REFUND!', 'HAROLD!', 'THE KIDS ARE IN THE CAR!'];
/** Outside, floating, fine (him, in the suit). */
export const MH_FLOAT = ["NOW THAT'S A RIDE.", 'BEST PART OF THE TOUR.', 'SHOULD HAVE LED WITH THIS.', 'FIVE STARS.'];

/** The vacuum (his callouts, if he ever lives through a hit of it: the invincibility cheat; and the death screen's). */
export const HURT_VACUUM = ["CAN'T BREATHE!", 'MY EYES ARE POPPING!', "IT'S SUCKING MY FACE OFF!"];
export const DEATH_VACUUM = ['SUCKED INTO SPACE', 'EXPLOSIVE DECOMPRESSION', 'FREEZE-DRIED', 'SPACED'];

const all = (r: ByPants) => [...r.clean, ...r.shitty, ...r.nude];
const guests = [...GUEST_VIEW, ...all(GUEST_REACT), ...all(GUEST_SUIT), ...GUEST_SCREAM];

export const VOICE_LINES: Record<string, string[]> = {
  [PA]: [...PA_UP, ...PA_SPACE, ...PA_DECK, ...PA_IDLE, ...all(PA_SUIT), ...PA_BREACH],
  meathead: [...MH_LOBBY, ...MH_UP, ...MH_SPACE, ...MH_DECK, ...MH_BORED, ...all(MH_SUIT), ...MH_CASE_EMPTY, ...MH_WINDOW, ...MH_SUCKED, ...MH_SUCKED_SUIT, ...MH_FLOAT, ...HURT_VACUUM],
  [GUEST_F]: guests,
  [GUEST_M]: guests,
  death: [...DEATH_VACUUM],
};

/** At the airlock (after) with no helmet on (him). */
export const MH_AIRLOCK_NO = ['NO SUIT, NO SPACE. EVEN I KNOW THAT.'];
VOICE_LINES.meathead.push(...MH_AIRLOCK_NO);
