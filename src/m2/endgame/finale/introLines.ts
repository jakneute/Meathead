// THE KAIJU FINALE's opening: what's said (ALL CAPS, American spelling; Meathead's lines clean / shitty pants / naked).
// Pure data (tools/voices reads it in node): every line here is in INTRO_VOICE_LINES, folded into the endgame's voice
// export (lines.ts). A full cutscene: the words go in the box along the bottom, nobody over anybody.
//
// The owner: "also all the bosses you kill are the children of satan and the alien widow, not just the first two
// bosses. show all their dead bodies as 'gross ups' when they both turn on meathead. rewrite some dialogue to let the
// player know as well". Every endgame boss was one of their kids: the widow's are ZORZARBLAX (the water park) and
// GUPPLAX (the wave pool); Satan's are MEHPHISTO and his brother BRATHAZAR (the lazy river) and NED the Necromancer
// (the lot). He walks up dragging all five on a rope; each parent claims their own; then the truce.

import { type ByPants, SATAN_VOICE, WIDOW_VOICE, CREW_VOICE, BEN_VOICE } from './lines';

const bp = (clean: string[], shitty: string[], nude: string[]): ByPants => ({ clean, shitty, nude });

/** The two of them, squabbling over him (the owner's: "still fighting over their claim to meathead"). */
export const SATAN_CLAIM = ['HE OWES ME A SOUL, FRISBEE. I HAD DIBS AT THE CASTLE.', 'BACK IN YOUR HUBCAP. THE FAT ONE IS MINE.'];
export const WIDOW_CLAIM = ['HE MADE ME A WIDOW, HORN BOY. HE GOES IN A JAR. MY JAR.', "I'VE GOT A JAR WITH HIS NAME ON IT. LABEL MAKER AND EVERYTHING."];
export const SATAN_BACK = ["JARS ARE FOR PICKLES. HE'S GOING IN THE LAKE.", 'YOUR HUSBAND WAS YOUR BROTHER. SIT DOWN.'];
/** Him, walking up on the two of them, the five of them on a rope behind him. */
export const MH_ARRIVE = bp(
  ['MORNING, ASSHOLES. THESE FIVE YOURS? THEY WERE IN MY WAY.', 'WHO ORDERED FIVE DEAD WEIRDOS?'],
  ['MORNING. THESE FIVE YOURS? ONE OF THEM MADE ME SHIT.', "WHO ORDERED FIVE DEAD WEIRDOS? THE SMELL IS ME. MOSTLY."],
  ["MORNING. THESE FIVE YOURS? DON'T LOOK AT MY DICK. LOOK AT THEM.", 'WHO ORDERED FIVE DEAD WEIRDOS? THE NAKED GUY DELIVERS.'],
);
/** What's on the rope (each one's look at it, before the cards). */
export const WIDOW_SEE = ['...THOSE ARE MY BOYS.', '...ZORZARBLAX? GUPPLAX? BABIES?'];
export const SATAN_SEE = ['...AND MINE. ALL THREE OF MINE.', "...THAT'S MY WHOLE FAMILY ON A ROPE."];
/** After the cards: each claims their own, by name. */
export const WIDOW_GRIEF = [
  'ZORZARBLAX. GUPPLAX. BOTH MY BOYS. ONE POPPED. ONE BURST.',
  'MY ZORZARBLAX. MY GUPPLAX. I CARRIED EACH OF THEM NINE YEARS.',
];
export const SATAN_GRIEF = [
  'MEHPHISTO. BRATHAZAR. NED. THREE SONS. THREE DISAPPOINTMENTS. MINE.',
  'THE MOODY ONE. THE LOUD ONE. AND NED. HE KILLED ALL MY BOYS.',
];
export const MH_KIDS = bp(
  ['ALL FIVE WERE YOURS? THEN YOU RAISED FIVE ASSHOLES.', 'THE WHOLE WATER PARK WAS YOUR KIDS? GET A SITTER.'],
  ["ALL FIVE WERE YOURS? ONE MADE ME SHIT MYSELF. WE'RE NOT EVEN.", 'YOUR KIDS? THEY STARTED IT. THE SMELL FINISHED IT.'],
  ['ALL FIVE WERE YOURS? THEY SAW ME NAKED. THEY WERE DONE ANYWAY.', 'YOUR KIDS? I LOST MY PANTS KILLING THEM. YOU OWE ME PANTS.'],
);
/** The truce. */
export const WIDOW_TRUCE = ['TRUCE, HORN BOY. WE KILL HIM TOGETHER. THEN I KILL YOU.', 'TRUCE. HIM FIRST. FOR THE KIDS. THEN YOU.'];
export const SATAN_TRUCE = ['FINE. TOGETHER. THEN YOU GO IN THE LAKE TOO.', "DEAL. BUT YOU'RE TOO SHORT TO HELP."];
/** Out of the saucer, onto the asphalt: "EMBIGGEN ME". */
export const WIDOW_EMBIGGEN = ['CREW! EMBIGGEN MOMMY! ALL THE WAY UP!', 'CREW! THE BIG RAY! MAKE MOMMY HUGE!'];
export const CREW_EMBIGGEN = ["EMBIGGENING, MA'AM!", "YES, MA'AM! FULL POWER!"];
export const SATAN_IMPRESSED = ['...HUH. NOT BAD FOR A FRISBEE.', "...OKAY. NOW YOU'RE TALL."];
/** Him, walking into the ray. */
export const MH_RAY = bp(
  ["OH, A FREE RAY? I'M IN.", 'MOVE. ME NEXT. I LOVE A RAY.'],
  ['A RAY. MAYBE IT SHRINKS THE SHIT.', "ME NEXT. DON'T EMBIGGEN THE PANTS."],
  ['A RAY. AIM IT AT MY DICK. WORTH A TRY.', 'ME NEXT. ALL OF ME. ESPECIALLY THE BOTTOM HALF.'],
);
/** Ben, in after him (only with all eight given). */
export const BEN_RAY = ['THE BIGGER THE MAN, THE BIGGER THE PUMP. MOVE OVER.', 'NEVER SKIP A FREE PUMP. SCOOT.'];
export const MH_BEN_RAY = bp(['CON-FUCK-TIOUS! YOU CAME!'], ["CON-FUCK-TIOUS! DON'T EMBIGGEN BEHIND ME!"], ["CON-FUCK-TIOUS! DON'T LOOK DOWN!"]);
/** Giant. */
export const MH_GIANT = bp(
  ["HOLY SHIT. I'M HUGE.", "I'M BIGGER THAN THE PARK. FINALLY."],
  ["HOLY SHIT. I'M HUGE. SO IS THE SHIT.", "I'M BIGGER THAN THE PARK. THE SMELL TOO."],
  ["HOLY SHIT. I'M HUGE. ALL OF ME. YOU'RE WELCOME, FLORIDA.", "BIGGER THAN THE PARK. AND I'M HANGING OVER IT."],
);
export const SATAN_GO = ['FOR MY BOYS. WE GRIND HIM INTO THE PARK.', 'COME, FRISBEE. WE STOMP HIM. FOR THE KIDS.'];
export const WIDOW_GO = ['FOR MY BABIES. THIS WAY. I PARKED BY THE GIFT SHOP.', 'FOLLOW ME, HORN BOY. MIND THE TOURISTS.'];

const flat = (...pools: (string[] | ByPants)[]) => pools.flatMap(p => (Array.isArray(p) ? p : [...p.clean, ...p.shitty, ...p.nude]));
/** Every line of the opening, by voice (endgame/lines.ts folds it into ENDGAME_VOICE_LINES). */
export const INTRO_VOICE_LINES: Record<string, string[]> = {
  meathead: flat(MH_ARRIVE, MH_KIDS, MH_RAY, MH_BEN_RAY, MH_GIANT),
  [SATAN_VOICE]: flat(SATAN_CLAIM, SATAN_BACK, SATAN_SEE, SATAN_GRIEF, SATAN_TRUCE, SATAN_IMPRESSED, SATAN_GO),
  [WIDOW_VOICE]: flat(WIDOW_CLAIM, WIDOW_SEE, WIDOW_GRIEF, WIDOW_TRUCE, WIDOW_EMBIGGEN, WIDOW_GO),
  [CREW_VOICE]: flat(CREW_EMBIGGEN),
  [BEN_VOICE]: flat(BEN_RAY),
};
