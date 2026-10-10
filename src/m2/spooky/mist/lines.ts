// What's said in the red-mist hallway (by voice: spooky/voices.ts gathers these). The PA ('m2.donnie.pa': Donnie as
// "Dracula") three ways, clean / shitty pants / naked, the pools the same size: off his script for once (it's not his
// mist; nobody explains it, ever). Meathead's remarks as he runs (one at a time, never over himself or the PA, never
// stopping the chase): baffled and annoyed, not scared, at actual supernatural shit in a cheap theme-park attraction.
// The mist is a new way to die: his death lines (and its own death: mist/death.ts).

import { PA, type ByPants } from '../castle/lines';

/** Into the hallway: the final ordeal... and then something's wrong. Said in order. */
export const PA_MIST: ByPants = {
  clean: [
    'AND NOV... THE FINAL ORDEAL. THE HALLVAY OF... VAIT. VHAT IS THAT? VHAT IS THAT RED... GARY? IS THE FOG MACHINE ON? GARY?',
    "...I MEAN. YES. MY MIST. MY TERRIBLE MIST. RUN, MORTAL. NO, SERIOUSLY. RUN. I'M NOT KIDDING HERE.",
  ],
  shitty: [
    'AND NOV... THE FINAL ORDEAL. THE HALLVAY OF... VAIT. VHAT IS THAT? IS THAT COMING OFF OF YOU? NO. IT IS RED. GARY? IS THE FOG MACHINE ON?',
    "...I MEAN. YES. MY MIST. IT FOLLOWS THE SMELL. YOU HAVE A LOT OF SMELL. RUN, MORTAL. I'M NOT KIDDING, BUDDY. GO.",
  ],
  nude: [
    'AND NOV... THE FINAL ORDEAL. THE HALLVAY OF... VAIT. VHAT IS THAT? GARY? IS THE FOG MACHINE ON? GARY, VHY IS IT RED?',
    "...I MEAN. YES. MY MIST. IT VILL COVER YOU. FINALLY, SOMETHING VILL. RUN. NO, SERIOUSLY. RUN, PAL.",
  ],
};
/** The door shut on it behind him (it's not getting through). One of. */
export const PA_MIST_SAFE: ByPants = {
  clean: [
    "...OKAY. HE MADE IT. GOOD. GOOD. GARY, VE ARE TURNING THAT THING OFF. GARY? ...GARY?",
    'AH. YOU SURVIVED. AS... I PLANNED. ALL PART OF THE TOUR. VE DO THAT EVERY DAY. YES.',
  ],
  shitty: [
    '...OKAY. HE MADE IT. AND THE MIST SPAT HIM BACK OUT. EVEN THE MIST VOULD NOT. GARY? ...GARY?',
    'AH. YOU SURVIVED. THE MIST TOOK ONE SNIFF OF YOU AND GAVE UP. AS... I PLANNED.',
  ],
  nude: [
    '...OKAY. HE MADE IT. NAKED. THROUGH THAT. I HAVE QUESTIONS. GARY? ...GARY?',
    'AH. YOU SURVIVED. AS... I PLANNED. THE NUDITY VAS NOT PLANNED. NONE OF IT VAS PLANNED.',
  ],
};

/** Meathead, as it comes out of the door behind him (after the PA). */
export const MH_MIST_START = ['WHAT IS THAT? WHAT IS THAT?!', 'RED FOG. NOPE. NOPE NOPE NOPE.'];
/** ...as he runs (in order, as long as it lasts; the first one first). */
export const MH_MIST = [
  'WHY IS THERE ACTUAL SUPERNATURAL SHIT IN A THEME PARK?!',
  "THAT'S NOT A FOG MACHINE! FOG MACHINES DON'T EAT PEOPLE!",
  'THE WALLS ARE BREATHING. WHY ARE THE WALLS BREATHING?!',
  "THE BLOOD'S GOING UP THE WALL! BLOOD DOESN'T GO UP! THAT'S NOT HOW BLOOD WORKS!",
  "WHO'S SLAMMING THE DOORS?! NOBODY'S SLAMMING THE DOORS!",
  "THE REST OF THIS PLACE IS PAPER MACHE AND A GUY IN A SHEET! WHY IS THIS PART REAL?!",
  "I'M NOT SCARED! I'M ANNOYED! THERE'S A DIFFERENCE!",
  'WHO DO I TALK TO ABOUT THE MIST? I WANT THE MIST\'S MANAGER!',
  "THERE'S NO WAY THIS PASSED INSPECTION!",
  'THIS IS A LAWSUIT! THIS IS A HUGE LAWSUIT!',
  "IF THAT STUFF TOUCHES ME I'M GONNA BE SO PISSED!",
  'A HAUNTED HOUSE IS SUPPOSED TO BE FAKE! THAT IS THE WHOLE DEAL!',
];
/** ...the guy in the sheet, caught by it behind him. */
export const MH_GARY = ['DID THAT GUY JUST TURN INTO SOUP?!', 'OH GOD. THE SHEET GUY. HE MELTED. HE MELTED INTO HIS SHEET.'];
/** The guy in the sheet, as it comes for him. */
export const GARY_SCREAM = ['OH NO. OH NO NO NO. THAT IS NOT OURS!', "THAT'S NOT IN THE SCRIPT! THAT'S NOT IN THE SCRIPT!"];
/** Meathead, through the door, it shut on the mist behind him. */
export const MH_MIST_SAFE = ["...THAT WASN'T IN THE BROCHURE.", "I'M GONNA PRETEND THAT DIDN'T HAPPEN. THAT DIDN'T HAPPEN."];

/** ...down a dead end of it. */
export const MH_DEADEND = ['NOPE. WRONG WAY. SUPERNATURAL MAZE. GREAT.', "BRICKED UP. OF COURSE IT'S BRICKED UP.", 'LOCKED?! WHO LOCKS A DOOR IN A DEATH MAZE?!'];
/** ...a way on that looked like a dead end. */
export const MH_FALSE_DOOR = ['OH. IT OPENS. SURE. WHY NOT.'];
export const MH_FALSE_WALL = ['I WAS GONNA PUNCH THAT WALL. IT JUST GAVE UP.'];
export const HURT_MIST = ['IT BURNS! IT BURNS INSIDE!', 'MY GUTS ARE ON THE OUTSIDE!'];
export const DEATH_MIST = ['TURNED INSIDE OUT', 'LIQUEFIED', 'MEATHEAD SOUP', 'A PUDDLE OF HIS FORMER SELF'];

const all = (r: ByPants) => [...r.clean, ...r.shitty, ...r.nude];

export const VOICE_LINES: Record<string, string[]> = {
  [PA]: [...all(PA_MIST), ...all(PA_MIST_SAFE)],
  meathead: [...MH_DEADEND, ...MH_FALSE_DOOR, ...MH_FALSE_WALL, ...MH_MIST_START, ...MH_MIST, ...MH_GARY, ...MH_MIST_SAFE, ...HURT_MIST],
  death: [...DEATH_MIST],
  'm2.spooky.gary': [...GARY_SCREAM],
};
