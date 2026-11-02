// Fairy Land after Piper's dead (the owner's revisit brief, 2026-11-02, verbatim: "piper no longer speaks on the
// megaphone. you still fight suitors, but their inentions are revenge for killing piper, not winning a contest. it
// otherwise plays the same."). Every line that changes on a revisit with her dead: his (no more horny for a voice; he
// knows what she was now, and what he did), the suitors' (out for blood for her, not out to win her), the cast's that
// were about her. Swapped in at each spot by revisit.ts (gonePants / gone). Lust's the sin: the suitors' was her, his
// was his dick. Pure data (tools/voices bundles it in node).

import { allOf, type ByPants } from './talk';
import { WHEEL_VOICES, type RosterId } from './wheel/lines';
import { GLEN_VOICES } from './glen/lines';
import { KEEP_VOICES } from './keep/lines';
import { SPIEL_VOICE } from './tragons/lines';

type Part = Partial<ByPants>;
const partAll = (p: Part) => [...(p.clean ?? []), ...(p.shitty ?? []), ...(p.nude ?? [])];

// ---------------------------------------------------------------------------------------------------------------
// Meathead

/** Land-wide (fantasy/lines.ts HORNY's spots: into a trial, past her castle, a suitor down). */
export const HORNY_R: ByPants = {
  clean: ["PIPER'S DEAD. MY DICK STILL WEARS BLACK.", 'I CAME HERE FOR PUSSY. I LEFT A BODY.', 'SHE WANTED MEN TO BLEED FOR HER. NOW THEY BLEED FOR HER CORPSE.'],
  shitty: ["PIPER'S GONE. THE SHIT STAYED.", 'NO PIPER. JUST ME AND MY LOAD.'],
  nude: ['NAKED IN FAIRY LAND. NOBODY LEFT TO PIPE.', 'NO PIPER. THIS BONER HAS NO DESTINATION.'],
};
/** In at the square's station on a visit after. */
export const SQUARE_BACK: ByPants = {
  clean: ['NO PIPER ON THE SPEAKERS. PEACE AND QUIET.', "HOGSMEAT AGAIN. THE PIXIE'S DEAD. BUTTER'S STILL FOURTEEN BUCKS."],
  shitty: ["BACK IN NERD TOWN. PIPER'S DEAD. MY PANTS AREN'T DOING GREAT EITHER.", 'NO PIPER PURRING. JUST MY ASS GURGLING.'],
  nude: ['BACK NAKED. NO PIPER TO SAVE IT FOR.', 'NERD TOWN. FULL FRONTAL. NO PIXIE.'],
};
/** At the bandstand, after the suitors' threats (where PIPE_HER and WINNING were). */
export const BAND_REPLY: ByPants = {
  clean: ['YOU WANT REVENGE FOR THAT? SHE WAS FOUR HUNDRED POUNDS OF CATFISH.', "SHE WASN'T A PIXIE. SHE WAS A BUFFET WITH A VOICE."],
  shitty: ['AVENGE HER? SHE WAS FATTER THAN MY SHIT. AND MY SHIT IS HUGE.', 'YOU HORNY IDIOTS NEVER SAW HER. I DID. I SHIT MYSELF.'],
  nude: ['SHE MADE MY DICK GO SOFT. FROM THE DOOR. YOU DODGED A WHALE.', 'I SAW HER NAKED. I MEAN I WAS NAKED. SHE WAS WORSE.'],
};
export const BAND_LAST: ByPants = {
  clean: ['COME AVENGE HER. ONE AT A TIME OR ALL AT ONCE.', 'LINE UP, LOSERS. SAME AS LAST TIME.'],
  shitty: ['COME GET ME. FOLLOW THE SMELL.', 'AVENGE HER. I DARE YOU. I REEK.'],
  nude: ['COME ON. AVENGE HER. MY DICK IS OUT. SO ARE MY FISTS.', "LINE UP. I'M NAKED AND I'M NOT SCARED."],
};
/** The fairy wheel: after a kill, the wheel clear. */
export const WHEEL_KILLED_R: ByPants = {
  clean: ['NEXT.', 'REVENGE DENIED.', 'GO SEE HER. SHE SAVED YOU A SEAT. ALL OF THEM.'],
  shitty: ['DIED SMELLING ME. TELL PIPER HI.', 'HE AVENGED NOTHING. HE SMELLED EVERYTHING.'],
  nude: ['KILLED BY A NAKED GUY. TWICE IN ONE PARK.', 'SAY HI TO PIPER. TELL HER NOTHING CHANGED DOWN HERE.'],
};
export const WHEEL_CLEAR_R: ByPants = {
  clean: ["WHEEL'S CLEAR. NO PRIZE THIS TIME. JUST BODIES.", 'ALL THAT REVENGE. ALL THAT DEAD.'],
  shitty: ["WHEEL'S CLEAR. THEY DIED FOR A FAT CHICK AND A SMELL.", 'TRIAL OVER. NO TRIAL. JUST ME. AND THIS.'],
  nude: ["WHEEL'S CLEAR. NAKED AND UNDEFEATED.", 'ALL DEAD. NOBODY TO IMPRESS. STILL NAKED.'],
};
/** The glen: its gag that was about her. */
export const GLEN_GAGS_R: Partial<Record<'mine', Part>> = {
  mine: { nude: ['COLD MINE. MY BALLS CRAWLED INSIDE ME.', "A DEEP DARK HOLE. LIKE PIPER'S GRAVE. BUT BIGGER."] },
};
/** The glen: in off the wheel; his answer to the rivals in the queue. */
export const GLEN_ARRIVE_R: ByPants = {
  clean: ['NO MORE TRIALS. JUST GUYS WHO WANT ME DEAD.', 'THE WOODS. FULL OF GUYS WHO MISS A FAT LADY.'],
  shitty: ['INTO THE WOODS. MY PANTS LEAD THE WAY.', 'NO PIPER, NO PRIZE. JUST SHIT AND TREES.'],
  nude: ['NAKED IN THE WOODS. NOBODY TO GET HARD FOR.', 'BACK IN THE WOODS. NO BONER THIS TIME.'],
};
export const GLEN_RETORT_R: ByPants = {
  clean: ['AVENGE HER? YOU NEVER EVEN SAW HER. LUCKY.', 'SHE WAS A VOICE AND FOUR HUNDRED POUNDS. YOU WANT TO DIE FOR THAT?'],
  shitty: ["I'LL SHIT IN YOUR DRAGON. THEN I'LL KILL YOU.", 'SMELL THAT? THAT IS WHAT HAPPENED TO PIPER.'],
  nude: ['COME AVENGE HER. MY DICK WILL WATCH.', "SHE SAW THIS AND SHE DIED. YOU'RE NEXT."],
};
/** Off the tragons' ride. */
export const TRAGONS_ARRIVE_R: ByPants = {
  clean: ['STILL ALIVE. NOBODY TO PUT ON SOMETHING SLUTTY.', "I WANT TO GO AGAIN. NO I DON'T."],
  shitty: ['RIDE OVER. PANTS OVER TOO.', 'MADE IT. A POUND OF ME STAYED ON THE LOOPS.'],
  nude: ["RIDE'S OVER. NO BONER. NO REASON.", "DONE. MY DICK'S WINDBURNED FOR NOTHING."],
};
/** The tragons' herald at the station (why the track's still full of holes: the owner's "a narrative reason for any
 *  events that repeat"). */
export const SPIEL_BACK = [
  'HEAR YE! THE TRACK HATH NOT BEEN FIXED. THE PIXIE IS DEAD AND HER ESTATE WILL NOT PAY.',
  'HARK! THE BOLTS ARE STILL OUT. THE GREAT PIXIE DIED BEFORE SHE TOLD US WHERE SHE HID THEM.',
];
/** The castle: in at its gate; the gags that were about her; on the broom; the heart canister. */
export const KEEP_ARRIVE_R: ByPants = {
  clean: ['HER CASTLE. NOBODY HOME. I MADE SURE.', 'BACK AT THE PIXIE PALACE. THE PIXIE IS IN A BAG.'],
  shitty: ['HER CASTLE AGAIN. I STILL SMELL WORSE THAN HER BEDROOM.', 'BACK AT HER GATE. LOAD IN MY PANTS. NOBODY TO DELIVER IT.'],
  nude: ['NAKED AT HER GATE. SHE CAN NOT SEE IT. SHE IS DEAD.', 'BACK. NAKED. NO PIPER TO RUIN IT.'],
};
export const KEEP_GAGS_R: Record<'bridge' | 'roses' | 'walls' | 'tower', Part> = {
  bridge: { clean: ['A DRAWBRIDGE. NOBODY TO LET ME IN. I LET MYSELF.', 'THE BRIDGE IS DOWN. SO IS PIPER.'] },
  roses: { clean: ['ROSES. FOR HER GRAVE. NO.', 'ROSES. THORNY ONES. PIPER GOT NONE.'] },
  walls: { clean: ['THE RAMPARTS. EVERYBODY UP HERE HAS A POINTY STICK.', 'UP ON THE WALL. I CAN SEE HER TOWER. NOBODY HOME.'] },
  tower: {
    clean: ['MORE MOVING STAIRS. TO A DEAD FAT LADY.', 'UP THE TOWER. NO SEX AT THE TOP. JUST A MESS.'],
    shitty: ['MORE STAIRS. MY PANTS ARE SLIDING DOWN THEM.', 'CLIMBING A TOWER IN SHIT PANTS. FOR NOTHING.'],
  },
};
export const MOUNT_R: ByPants = {
  clean: ['A BIG STICK BETWEEN MY LEGS. TIME TO HIT GUYS WITH IT.', 'LAST MAN FLYING GETS NOTHING. I FLY ANYWAY.'],
  shitty: ["BRISTLES IN MY SHIT PANTS. LET'S GO.", 'THEY WANT REVENGE. THEY GET MY SMELL AT A HUNDRED MILES AN HOUR.'],
  nude: ['BARE ASS ON A BROOMSTICK. SPLINTERS. NOT WORTH IT.', 'NAKED ON A BROOM. THE BRISTLES ARE TICKLING MY TAINT.'],
};
export const HEART_GOT_R: ByPants = {
  clean: ['A BIGGER HEART. MORE THAN PIPER HAD.', 'ALL THOSE STAIRS FOR A HEART IN A JAR. WORTH IT.'],
  shitty: ['MORE HEART. STILL A LOAD IN MY PANTS.', 'I CLIMBED ALL THAT WITH SHIT IN MY JEANS. I EARNED THIS.'],
  nude: ['A BIGGER HEART. MY DICK WANTS ONE TOO.', 'NAKED UP A MAGIC STAIRCASE FOR A JAR HEART. LIVING.'],
};
/** The broomsticks. */
export const BROOM_R: Record<'start' | 'kill' | 'wall' | 'late' | 'last' | 'win', Part> = {
  start: {
    clean: ['THEY WANT REVENGE. THEY GET GRAVITY.', "NOBODY'S WATCHING FROM THE WINDOW. KILL 'EM ANYWAY."],
    nude: ['NAKED ON A BROOM. THE BRISTLES ARE IN MY ASS CRACK.', 'NO BONER. NO WINDOW. JUST MURDER.'],
  },
  kill: { clean: ['ONE LESS DICK IN THE SKY.', 'GROUNDED. PERMANENTLY.', 'GO SEE HER. SHE SAVED YOU A SPOT.'] },
  wall: { clean: ['A MAGIC WALL. SHE DIED AND IT STAYED ON.', 'A FORCE FIELD. THEY SPENT MONEY ON THAT AND NOT TOILET PAPER.'] },
  late: { clean: ['MORE OF THEM? HOW MANY GUYS WANTED THAT LADY?', 'LATE ENTRIES. LATE TO THEIR FUNERALS.'] },
  last: {
    clean: ['ONE LEFT. THEN NOTHING. THEN HOME.', 'LAST ONE. PIPER, HERE COMES COMPANY.'],
    shitty: ['ONE LEFT. THEN A WET WIPE.'],
    nude: ['ONE LEFT. THEN PANTS. MAYBE.'],
  },
  win: {
    clean: ["LAST MAN FLYING. NOBODY'S WAITING. I'M GOING IN ANYWAY.", 'ALL DEAD. THE WINDOW AGAIN. I KNOW THE WAY.'],
    shitty: ['I WON. I\'M COMING IN HOT. AND BROWN. TO AN EMPTY ROOM.', 'HER WINDOW. NO PIPER. STILL NO BIDET.'],
    nude: ['NO BONER. JUST HABIT. THE WINDOW.', 'NAKED. FULL SPEED. AN EMPTY BEDROOM.'],
  },
};
/** In her bedroom, empty (the boss arena: his line, then the hub). */
export const EMPTY_ROOM: ByPants = {
  clean: ['HER ROOM. STILL SMELLS LIKE HAM AND PERFUME.', "EMPTY. ALL THAT FOR A FAT LADY. I'M OUT.", 'SHE WANTED TO BE FOUGHT OVER. NOBODY CAME.'],
  shitty: ['HER ROOM. I LEFT MORE SHIT HERE THAN SHE DID.', "NOTHING HERE. THE MATTRESS IS STILL BENT. I'M OUT."],
  nude: ['HER BED. NAKED. ALONE. NOT THE PLAN.', 'EMPTY ROOM. LIMP DICK. LET\'S GO.'],
};

// ---------------------------------------------------------------------------------------------------------------
// The suitors: out for blood for her now

/** At the bandstand (Braxton, Gunnar, then Tremaine at him). */
export const BRAXTON_R: ByPants = {
  clean: ["THAT'S HIM, BRO. HE KILLED PIPER.", 'NO MORE TRIALS, BRO. JUST HIM. DEAD.'],
  shitty: ['HE KILLED PIPER AND HE SMELLS LIKE THAT? DOUBLE MURDER, BRO.', 'BRO. THE PIXIE KILLER SHIT HIMSELF.'],
  nude: ['THE GUY WHO KILLED PIPER IS NAKED, BRO.', 'HE KILLED HER WITH THAT OUT? BRO.'],
};
export const GUNNAR_R: ByPants = {
  clean: ['I BULKED FOR HER. NOW I CUT. YOUR THROAT.', 'VALHALLA FOR PIPER. HELL FOR YOU.'],
  shitty: ['THE PIXIE KILLER STINKS OF A LONGHOUSE TOILET.', 'HE SHAT. SHE DIED. GUNNAR KILLS.'],
  nude: ['HE KILLED OUR PIXIE NAKED. GUNNAR KILLS HIM NAKED.', 'GUNNAR WILL AVENGE HER. GUNNAR WILL NOT LOOK DOWN.'],
};
export const TREMAINE_R: ByPants = {
  clean: ['SHE WAS GONNA PICK ME. YOU KILLED MY WIFE.', 'WE NEVER EVEN MET HER. YOU STOLE THAT.'],
  shitty: ['YOU KILLED HER SMELLING LIKE THAT? SHE DIED OF IT.', "YOU MURDERED HER IN THOSE PANTS. THAT'S A HATE CRIME."],
  nude: ['YOU SHOWED UP NAKED AND KILLED HER. WHAT IS WRONG WITH YOU?', 'PUT IT AWAY. THEN DIE.'],
};
/** The fairy wheel: their own lines (the six on it), at him, at each other (after who gets to kill him), his cart won
 *  back off him. */
export const WHEEL_OWN_R: Partial<Record<RosterId, string[]>> = {
  braxton: ['I OILED UP FOR PIPER. NOW I OIL UP FOR YOUR FUNERAL.', 'THIS ONE IS FOR PIPER!'],
  gunnar: ['FOR PIPER! VALHALLA!', 'GUNNAR AVENGES THE PIXIE!'],
  tremaine: ['SHE WAS MINE. YOU KILLED HER. NOW I KILL YOU.', "CALVES LIKE THESE DON'T FORGIVE."],
  chad: ['THIS IS FOR PIPER, BRO.', "SHE NEVER SAW MY GUNS, BRO. YOU'LL FEEL THEM."],
  derek: ["M'LADY PIPER, I AVENGE THEE.", 'NINE FAIRE PASSES. ALL FOR HER. YOU DIE.'],
  wayne: ['I CAST LEVEL NINE REVENGE.', 'MY STAFF IS FOR PIPER. AND YOUR SKULL.'],
};
export const AT_HIM_R: ByPants = {
  clean: ['THAT ONE IS FOR PIPER!', 'PIXIE KILLER!', 'MURDERER!'],
  shitty: ['DIE, SHIT PANTS! FOR PIPER!', 'PIXIE KILLER SMELLS LIKE A GREYHOUND SHITTER!'],
  nude: ['DIE NAKED, PIXIE KILLER!', 'PUT SOME PANTS ON AND DIE!'],
};
export const AT_RIVAL_R = ["HE'S MINE TO KILL, BRO!", 'BACK OFF! I AVENGE HER!', 'OUT OF MY WAY! HE KILLED PIPER!'];
export const QTE_WIN_R: ByPants = {
  clean: ['THAT WAS FOR PIPER!', 'FLY, PIXIE KILLER!'],
  shitty: ['FOR PIPER! TAKE YOUR SMELL WITH YOU!'],
  nude: ['FOR PIPER! TAKE YOUR TINY DICK WITH YOU!'],
};
/** The glen's queue. */
export const GLEN_RIVAL_R: Record<'blake' | 'rafael' | 'hank', ByPants> = {
  blake: {
    clean: ["YOU KILLED PIPER, BRO. YOU'RE NOT GETTING OFF THIS RIDE.", 'NO PRIZE, BRO. JUST PAYBACK.'],
    shitty: ['THE PIXIE KILLER SHIT HIMSELF AGAIN, BRO.', 'SHE DIED SMELLING YOU, BRO. CRUEL.'],
    nude: ['BRO. YOU KILLED HER NAKED. PANTS. PLEASE.', 'THE NAKED PIXIE KILLER. BRO. WOW.'],
  },
  rafael: {
    clean: ['SHE WAS ROYALTY. YOU WERE A SNACK BAR. NOW YOU ARE DEAD.', 'MY DAD OWNS THREE CAR WASHES. ONE WILL WASH YOUR BLOOD OFF THE DRAGON.'],
    shitty: ['A PRINCE AVENGES. A PRINCE DOES NOT SMELL LIKE THAT.', 'SHE DIED. AND YOU STILL SMELL WORSE.'],
    nude: ['NAKED? YOU KILLED HER LIKE THAT?', 'THAT LITTLE THING IS WHAT KILLED PIPER?'],
  },
  hank: {
    clean: ['HANK SAD. PIPER GONE. LITTLE MAN FALL OFF. HANK WATCH.', 'HANK AVENGE PIXIE. HANK STRONG.'],
    shitty: ['PIXIE KILLER STINK. HANK HATE.', 'STAY OUT OF HANK CAR, MURDER BOY.'],
    nude: ['LITTLE MAN KILL PIPER NAKED. HANK CRY.', 'NOT IN HANK CAR WITH THAT OUT, KILLER.'],
  },
};
/** The boutique (only the lines that were about her). */
export const SHOP_R: Record<'blake' | 'rafael', Part> = {
  blake: { clean: ['THE FACE MASK IS FOR HER FUNERAL, BRO. AND MY BACK ACNE.', 'YOU LIVED? I PAID A GUY TO LOOSEN YOUR DRAGON.'] },
  rafael: { clean: ['A PRINCE NEEDS HIS GLOW. FOR HER WAKE.', 'THE TIARA IS FOR HER. YOU TOOK HER. I TAKE YOU.'] },
};
/** The runway: Rafael's that was about her window; and Dmitri where she was on the PA (the final trial, the rules, go). */
export const RUNWAY_RAFAEL_R: Part = { clean: ['SHE SHOULD HAVE SEEN ME FROM HER WINDOW. YOU TOOK THAT.', 'I FLY FIRST CLASS. YOU FLY TO HELL.'] };
export const RUNWAY_FINAL_R: ByPants = {
  clean: ['YOU KILLED PIPER, LITTLE MAN. NO MORE TRIALS.', 'PIPER IS DEAD. EVERYBODY KNOWS WHO DID IT.'],
  shitty: ['YOU KILLED PIPER AND YOU STILL SMELL, LITTLE MAN.', 'THE PIXIE IS DEAD. THE SMELL LIVES.'],
  nude: ['YOU KILLED PIPER WITH YOUR PEANUT OUT.', 'PIPER IS DEAD. YOU ARE NAKED. BOTH ARE SAD.'],
};
export const RUNWAY_RULES_R: ByPants = {
  clean: ['NEW RULES. LAST MAN FLYING IS NOT YOU.', 'NO WINDOW. NO PRIZE. IN THE SKY, WE ALL KILL YOU.'],
  shitty: ['WE KNOCK YOU OUT OF THE SKY. LIKE A TURD FROM A PIGEON.', 'ONE RULE. THE SMELLY ONE DIES.'],
  nude: ['WE KNOCK YOU OUT OF THE SKY, NAKED MAN.', 'ONE RULE. THE NAKED ONE DIES.'],
};
export const RUNWAY_GO_R: ByPants = {
  clean: ['FOR PIPER! KILL HIM!', 'FLY. AND BREAK HIS NECK.'],
  shitty: ['FOR PIPER! FLY UPWIND!', 'GO! KILL THE STINKY ONE!'],
  nude: ['FOR PIPER! KILL THE PEANUT!', 'GO! DO NOT LOOK DOWN AT HIM!'],
};
/** The broomsticks: Rafael's taunt about her watching; Blake's, Rafael's and Hank's at each other (about her). */
export const BROOM_RAFAEL_R: Part = { clean: ['SHE CAN NOT WATCH ANYMORE. I WILL WATCH YOU DIE FOR HER.', 'LOOK AT MY JAW. NOW LOOK AT YOUR JAW. EXACTLY.'] };
export const BROOM_RIVAL_R: Partial<Record<'blake' | 'rafael' | 'hank', string[]>> = {
  blake: ["MOVE, BRO! HE'S MINE!", 'OUT OF MY SKY, BRO! I AVENGE HER!'],
  rafael: ['FEWER OF US. MORE OF HIS BLOOD FOR ME.', 'NOTHING PERSONAL. YOU HAVE A WEAK CHIN.'],
  hank: ['HAVE AT THEE!', 'FOR PIPER! AND TURKEY LEG!'],
};

// ---------------------------------------------------------------------------------------------------------------
// The cast (the lines that were about her)

/** Cupid (Piper's hired help). */
export const CUPID_R: Part = { clean: ['PIPER DIED OWING ME. HOLD STILL.', 'I WEAR A DIAPER FOR TWELVE BUCKS AN HOUR.', "MY BOSS IS DEAD AND I'M STILL IN THE DIAPER."] };
/** The courtiers (her ladies in waiting). */
export const COURTIER_R: Part = { clean: ['MURDERER! THE GREAT PIXIE IS DEAD!', 'BACK, PEASANT! WE ARE IN MOURNING!', 'SHE WAS LARGE. SHE WAS LOVED. YOU KILLED HER.'] };

// ---------------------------------------------------------------------------------------------------------------

const own = (id: RosterId) => [...(WHEEL_OWN_R[id] ?? []), ...allOf(AT_HIM_R), ...AT_RIVAL_R, ...allOf(QTE_WIN_R)];
export const VOICE_LINES: Record<string, string[]> = {
  meathead: [
    ...[HORNY_R, SQUARE_BACK, BAND_REPLY, BAND_LAST, WHEEL_KILLED_R, WHEEL_CLEAR_R, GLEN_ARRIVE_R, GLEN_RETORT_R, TRAGONS_ARRIVE_R,
      KEEP_ARRIVE_R, MOUNT_R, HEART_GOT_R, EMPTY_ROOM].flatMap(allOf),
    ...[...Object.values(KEEP_GAGS_R), ...Object.values(BROOM_R), ...Object.values(GLEN_GAGS_R) as Part[]].flatMap(partAll),
  ],
  // (the wheel's six, each its own; Braxton, Gunnar and Tremaine at the bandstand too)
  ...Object.fromEntries((['braxton', 'gunnar', 'tremaine', 'chad', 'derek', 'wayne'] as RosterId[]).map(id => [WHEEL_VOICES[id], [
    ...own(id), ...(id === 'braxton' ? allOf(BRAXTON_R) : id === 'gunnar' ? allOf(GUNNAR_R) : id === 'tremaine' ? allOf(TREMAINE_R) : []),
  ]])),
  [GLEN_VOICES.blake]: [...allOf(GLEN_RIVAL_R.blake), ...partAll(SHOP_R.blake), ...(BROOM_RIVAL_R.blake ?? [])],
  [GLEN_VOICES.rafael]: [...allOf(GLEN_RIVAL_R.rafael), ...partAll(SHOP_R.rafael), ...partAll(RUNWAY_RAFAEL_R), ...partAll(BROOM_RAFAEL_R), ...(BROOM_RIVAL_R.rafael ?? [])],
  [GLEN_VOICES.hank]: [...allOf(GLEN_RIVAL_R.hank), ...(BROOM_RIVAL_R.hank ?? [])],
  [SPIEL_VOICE]: SPIEL_BACK,
  [KEEP_VOICES.dmitri]: [RUNWAY_FINAL_R, RUNWAY_RULES_R, RUNWAY_GO_R].flatMap(allOf),
  [GLEN_VOICES.cupid]: partAll(CUPID_R), [GLEN_VOICES.cupidf]: partAll(CUPID_R),
  [KEEP_VOICES.courtier]: partAll(COURTIER_R), [KEEP_VOICES.courtierf]: partAll(COURTIER_R),
};
