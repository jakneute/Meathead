// Cartoon Land after DAD GUY's dead: the in-world reasons for what happens again on a revisit (the owner: "come up with
// some kind of narrative reason for any events that repeat not directly tied to the boss of the stage"). The Socks show
// is a RERUN now (Chelsea's actress says so going in, holding it together after last time's slaughter); the mean men he puffed are back (each with his own excuse, true to the
// man); he answers. Picked with pickLine; pants pools where they react to him. Pure data (tools/voices bundles it).

import { allOf, type ByPants } from './talk';
import { CHELSEA, PEROT, FALWELL } from './whitehouse1/lines';
import { LIMBAUGH, DOLE, NEWT } from './whitehouse2/lines';

/** Chelsea's actress, back on the job after last time (the owner: "the actress playing chelsea clinton in cartoon land
 *  will try to stay professional while acknowledging she went through seeing actors getting brutally slaughtered
 *  earlier"): the script, the forced smile, the cracks. Going in (where CHELSEA_INTRO was): the reason it runs again. */
export const CHELSEA_RERUN = [
  "HI, SOCKS! IT'S A... RERUN! THE MEAN MEN ARE BACK! THE GUYS WHO PLAYED THEM LAST TIME ARE... IN BAGS!",
  "HI AGAIN, SOCKS! THE NETWORK SAYS THE SHOW MUST GO ON! I SAID NO! THEY SAID UNION SCALE! HI, SOCKS!",
];
export const CHELSEA_INTRO2_R: ByPants = {
  clean: ["IT'S JUST YOU AND ME, SOCKS! AND MY THERAPIST! SHE'S NOT HERE! WE HAVE TO STOP THEM!"],
  shitty: ["SOMEBODY MADE A STINKY! LAST TIME IT WAS THE GUY YOU TORE IN HALF! WE HAVE TO STOP THEM!"],
  nude: ["SOCKS, WHERE ARE YOUR PANTS? LAST TIME I SAW A MAN'S INSIDES! THIS IS FINE! LET'S GO!"],
};
/** Her nags, holding it together. */
export const NAG_R: ByPants = {
  clean: ["SOCKS! THIS WAY! PLEASE DON'T KILL ANYBODY! I MEAN, GO GET THEM!", "SOCKS! I'M SMILING! I'M SMILING BECAUSE IT'S IN MY CONTRACT!", 'SOCKS! SOCKS! I STILL HEAR THE SCREAMING! THIS WAY!'],
  shitty: ['SOCKS, YOU STINK! LAST TIME A MAN STANK LIKE THAT, HE WAS DEAD! THIS WAY!', 'SOCKS, SMELL IS A TRIGGER FOR ME! KEEP MOVING!'],
  nude: ["SOCKS, PUT IT AWAY! I'VE SEEN ENOUGH MEAT IN HERE FOR ONE LIFETIME!", 'SOCKS! YOUR PANTS! I MEAN, THE MEAN MEN! THIS WAY!'],
};
export const OUCH_R = ['SOCKS! ARE YOU OKAY? PLEASE BE OKAY! I CANNOT DO ANOTHER FUNERAL!', 'NO! NOT AGAIN! I MEAN... GET UP, SOCKS!', 'SOCKS IS HURT! EVERYBODY STAY CALM! I AM CALM!'];
export const CHEER_R = ["YAY, SOCKS! HE'S... HE'S IN PIECES. YAY!", 'GOOD KITTY. GOOD KITTY. GOOD KITTY. GOOD KITTY.', 'SOCKS WINS! I HAVE TO GO THROW UP! SOCKS WINS!', "TAKE THAT, MEAN MAN! I'M SO SORRY! TAKE THAT!"];
export const COWER_R = ["I'M HIDING, SOCKS! I'VE BEEN HIDING SINCE LAST WEEK!", "I CAN'T LOOK! I LOOKED LAST TIME! I CAN'T LOOK!", 'THIS IS WORSE THAN THE PRESS CORPS! THE PRESS CORPS NEVER BLED ON ME!'];

/** The pundits back (in place of their intro), by who. */
export type BackId = 'perot' | 'falwell' | 'limbaugh' | 'dole' | 'newt';
export const PUNDIT_BACK: Record<BackId, ByPants> = {
  perot: {
    clean: ["I'M BACK IN. I DROPPED OUT, I GOT BACK IN. THAT'S MY THING, KITTY.", 'YOU HEAR THAT SUCKING SOUND? IT\'S ME, BACK FROM THE DEAD. RERUNS PAY.'],
    shitty: ["I'M BACK, AND THE KITTY STILL SMELLS LIKE A FEEDLOT.", 'BACK IN THE RACE. YOU STILL SHIT YOURSELF. SOME THINGS DON\'T CHANGE.'],
    nude: ["I'M BACK IN. THE CAT'S STILL NAKED. IT'S A CAT. STILL WEIRD.", 'BACK FROM THE DEAD, AND YOUR PECKER IS STILL OUT, KITTY.'],
  },
  falwell: {
    clean: ['THE LORD RAISED ME ON THE THIRD DAY. THE NETWORK RAISED ME ON THE SECOND.', 'I AM RISEN, DEVIL CAT! IT WAS IN MY CONTRACT!'],
    shitty: ['I AM RISEN. YOU STILL STINK OF SODOM, KITTY.', 'RESURRECTED FOR THIS? HE STILL SMELLS LIKE SIN.'],
    nude: ['I AM RISEN, AND YOU ARE STILL NAKED. REPENT. COVER IT.', 'THE LORD BROUGHT ME BACK. PUT YOUR SIN AWAY.'],
  },
  limbaugh: {
    clean: ["YOU CAN'T CANCEL ME, KITTY. I'M ON SIX HUNDRED STATIONS.", "I'M BACK. ON A HIGHER WATTAGE. DITTOS."],
    shitty: ['BACK ON THE AIR, AND IT SMELLS LIKE A LIBERAL IN HERE.', 'SYNDICATED AGAIN. YOU STILL SHIT YOURSELF, KITTY. TYPICAL.'],
    nude: ["BACK ON THE AIR. AND THE CAT'S STILL NAKED. ON THE TAXPAYER'S DIME.", 'YOU CANCELED ME NAKED. NOW I\'M BACK. NOW YOU\'RE STILL NAKED.'],
  },
  dole: {
    clean: ['BOB DOLE IS BACK. BOB DOLE IS RUNNING AGAIN. BOB DOLE ALWAYS RUNS AGAIN.', 'BOB DOLE GOT RENEWED. BOB DOLE IS HAPPY ABOUT IT. BOB DOLE IS NOT HAPPY.'],
    shitty: ['BOB DOLE IS BACK. THE CAT STILL SMELLS. BOB DOLE NOTICED.', 'BOB DOLE CAME BACK FOR THIS SMELL? BOB DOLE IS SAD.'],
    nude: ["BOB DOLE IS BACK. THE CAT'S STILL NAKED. BOB DOLE IS NOT LOOKING.", 'BOB DOLE IS RUNNING AGAIN. AWAY FROM THAT.'],
  },
  newt: {
    clean: ['CONTRACT WITH AMERICA. PART TWO. YOU SIGNED NOTHING.', 'THE REPUBLICAN REVOLUTION IS BACK. IN RERUNS. STILL A REVOLUTION.'],
    shitty: ['PART TWO. AND THE CAT STILL SHITS ON THE CARPET.', 'I CAME BACK AND YOU STILL SMELL LIKE A WELFARE OFFICE.'],
    nude: ['PART TWO, KITTY. STILL NAKED. STILL A DISGRACE.', 'THE REVOLUTION IS BACK. YOUR PANTS ARE NOT.'],
  },
};
/** His answer to one of them back. */
export const BACK_REPLY: ByPants = {
  clean: ['DIDN\'T I POOF YOU ALREADY?', 'YOU AGAIN? FINE. I KILL YOU IN RERUNS TOO.'],
  shitty: ['YOU CAME BACK FOR THIS SMELL? BRAVE.', 'I POOFED YOU ONCE. I SHIT MYSELF TWICE. WE\'RE EVEN.'],
  nude: ['BACK FROM THE DEAD TO SEE MY BALLS AGAIN. SICK.', 'YOU AGAIN. ME NAKED AGAIN. LET\'S GO.'],
};

export const VOICE_LINES: Record<string, string[]> = {
  meathead: allOf(BACK_REPLY),
  [CHELSEA]: [...CHELSEA_RERUN, ...allOf(CHELSEA_INTRO2_R), ...allOf(NAG_R), ...OUCH_R, ...CHEER_R, ...COWER_R],
  [PEROT]: allOf(PUNDIT_BACK.perot), [FALWELL]: allOf(PUNDIT_BACK.falwell),
  [LIMBAUGH]: allOf(PUNDIT_BACK.limbaugh), [DOLE]: allOf(PUNDIT_BACK.dole), [NEWT]: allOf(PUNDIT_BACK.newt),
};
