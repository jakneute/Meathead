// The water park, level 3 (THE MAINTENANCE TUNNELS, THE WAVE POOL): what's said (ALL CAPS, American spelling; clean /
// shitty / naked wherever it's his or said to him). Every line here is in PARK3_VOICE_LINES (endgame/lines.ts folds it
// into ENDGAME_VOICE_LINES, recorded by npm run voices).
//
// GUPPLAX: the wave pool's lifeguard, an alien (the aliens' turn). Zorblax and Zarblax's brother (the family's what it
// is: so the kid on the summit was his nephew twice over). A bloated, sweating, gill-flapping slob in a lifeguard's
// red trunks two sizes small, zinc on his nose, a whistle he never stops blowing. Erratic: giggles, screams, blows the
// whistle at nothing. He runs the deep end and calls everything he doesn't like a pussy. His grudge: Meathead killed
// his nephew on the mountain. Undignified to the end.

import type { ByPants } from '../park1/lines';
export type { ByPants };
const bp = (clean: string[], shitty: string[], nude: string[]): ByPants => ({ clean, shitty, nude });

export const GUP_VOICE = 'm2.wp.gupplax';
export const GUP_NAME = 'GUPPLAX';
/** The possessed staff talk in the aliens' voices (park1's possessed guests'). */
export const STAFF_VOICE = { m: 'm2.space.alien', f: 'm2.space.alienf' };

// ---------------------------------------------------------------------------------------------------------------
// Meathead, going

export const MH_DOOR3 = bp(["MAINTENANCE. NOBODY'S MAINTAINED SHIT IN HERE."], ['MAINTENANCE. SMELLS LIKE ME IN HERE.'], ["MAINTENANCE. AUTHORIZED PERSONNEL ONLY. I'M AUTHORIZED. I'M NAKED."]);
export const MH_IN = bp(
  ['THE STAFF ARE POSSESSED. HOW CAN YOU TELL?', 'GREEN EYES. SAME WORK ETHIC.'],
  ['EVEN THE JANITORS LOOK AT ME LIKE THAT.', 'POSSESSED JANITORS. THEY STILL WON\'T CLEAN ME UP.'],
  ['POSSESSED JANITORS. THEY DON\'T EVEN LOOK UP AT A NAKED GUY.', 'GREEN EYES. NO PANTS. WE MATCH. ALMOST.'],
);
export const MH_PISS = bp(
  ["EVERY KID'S PEE IN THE WHOLE PARK. IN ONE TANK.", "DON'T FALL IN THE PEE. DON'T FALL IN THE PEE."],
  ["A WHOLE TANK OF PEE. FOR ONCE I'M NOT THE WORST THING IN THE ROOM.", "IT SMELLS BETTER THAN ME. THAT'S THE SAD PART."],
  ["A TANK OF PEE AND I'M NAKED OVER IT. ONE SLIP.", "DON'T FALL IN. NOTHING TO HIDE BEHIND."],
);
export const MH_CHEM = bp(
  ['PRODUCT OF QUESTION MARKS. THAT GOES IN THE POOLS.', "THAT'S WHY THE POOL WATER'S PURPLE."],
  ["CHLORINE. SHOULD'VE BROUGHT SOME FOR MY PANTS.", 'THE DRUMS ARE LEAKING. SO AM I.'],
  ["CHLORINE GAS AND I'M NAKED. EVERYTHING'S EXPOSED.", 'BLEACH IN THE AIR. MY BALLS ARE GONNA BE BLOND.'],
);
export const MH_GANG = bp(
  ['STAIRS THAT MOVE. WHO BUILDS STAIRS THAT MOVE?', 'NO HANDRAIL. OF COURSE.'],
  ['MOVING STAIRS OVER SLUDGE. MY ASS IS CLENCHED. TOO LATE.', 'NO HANDRAIL. NO DIGNITY.'],
  ['MOVING STAIRS. EVERYTHING SWINGS. EVERYTHING.', 'NO HANDRAIL. NOTHING TO HOLD BUT MYSELF.'],
);
export const MH_SHAFT = bp(['STEAM VENTS. MOSTLY OFF. SURE.', 'DOWN WE GO.'], ['STEAM. MIGHT CLEAN ME UP.', 'DOWN WE GO. STINK FIRST.'], ['STEAM. ON MY BARE ASS.', 'DOWN WE GO. CAREFUL ON THE RUNGS.']);
export const MH_SWIM = bp(
  ["THE PIPES ARE FLOODED. NOBODY CALLED A PLUMBER. EVER.", 'HOLD YOUR BREATH, MEATHEAD.'],
  ['FLOODED PIPES. FINALLY A BATH.', 'HOLD YOUR BREATH. EVERYBODY ELSE IS.'],
  ['FLOODED PIPES. SKINNY DIPPING IN SEWAGE.', 'HOLD YOUR BREATH. SHRINKAGE.'],
);
export const MH_VALVE = bp(
  ['GREEN LIGHT, GO. RED LIGHT, DON\'T.', 'THE FLAP SWITCHES. WAIT FOR IT.'],
  ['GREEN, GO. RED, STAY. LIKE MY BOWELS.', 'THE FLAP SWITCHES. WAIT FOR IT. CLENCH.'],
  ['GREEN, GO. RED, STAY. EVERYTHING FLOATS.', 'THE FLAP SWITCHES. KEEP YOUR BITS AWAY FROM IT.'],
);
export const MH_PUSHED = bp(['THE CURRENT! IT SHOVED ME BACK!', 'BACK TO THE START! COME ON!'], ['THE CURRENT! IT WASHED ME BACK! NOT CLEAN, THOUGH!', 'BACK DOWN THE PIPE! AGAIN!'], ['THE CURRENT! IT TOOK ME BACK! NAKED!', 'BACK DOWN THE PIPE! EVERYTHING FLAPPING!']);
export const MH_PUMP = bp(
  ['WAVE POOL OUTFLOW. KEEP CLEAR. NOPE.', 'THE BIG REFILL. SOMETHING BIG IS DOWN THERE.'],
  ['WAVE POOL OUTFLOW. AT LEAST IT RINSES.', 'BIG REFILL. BIG STINK. BIG FIGHT.'],
  ['WAVE POOL OUTFLOW. GOING DOWN NAKED.', 'BIG REFILL. NOW INTO THE DRAIN. NAKED.'],
);
export const MH_AIR_LOW = ['AIR! I NEED AIR!', "MY LUNGS! THEY'RE EMPTY!", 'UP! GET UP!'];

// ---------------------------------------------------------------------------------------------------------------
// The possessed staff (janitors, technicians): barks (the aliens' voices)

export const STAFF_BARK = bp(
  ['NOT MY JOB. KILLING YOU IS. NOW.', 'THE HIVE SAYS MOP UP THE HUMAN.', "I'M ON BREAK. FOREVER. FOR THE HIVE.", 'CLOCK IN. CLOCK OUT. KILL THE BIG ONE.', "THE HIVE PAYS BETTER THAN THE PARK."],
  ['THE HIVE SAYS MOP UP THE SHITTY HUMAN.', "THAT'S NOT IN MY JOB DESCRIPTION. NEITHER IS THE SMELL.", 'CODE BROWN. CODE HIVE.', "I MOPPED UP WORSE. NOT MUCH WORSE."],
  ['THE HIVE SAYS MOP UP THE NAKED HUMAN.', "PUT IT AWAY. EVEN THE HIVE'S EMBARRASSED.", 'CODE NUDE. CODE HIVE.', "I'VE SEEN WORSE IN THE LOCKER ROOM."],
);

// ---------------------------------------------------------------------------------------------------------------
// GUPPLAX: the wave pool

/** The flush in: shot out through the grate (his line as he's spat into the pool). */
export const MH_FLUSHED = bp(['WHO FLUSHED?!'], ['WHO FLUSHED?! WAIT. THAT WAS ME.'], ['WHO FLUSHED?! IN THE NUDE!']);
/** The intro (the gross-up): who he is, the grudge. */
export const GUP_INTRO = bp(
  ["TWEEEET! NO RUNNING! NO DIVING! NO HUMANS! I'M GUPPLAX! YOU KILLED MY NEPHEW!"],
  ["TWEEEET! NO RUNNING! NO DIVING! NO SHITTING IN THE POOL! I'M GUPPLAX! YOU KILLED MY NEPHEW!"],
  ["TWEEEET! NO RUNNING! NO DIVING! NO SWIMMING NUDE! I'M GUPPLAX! YOU KILLED MY NEPHEW!"],
);
export const MH_GUP = bp(
  ['YOUR NEPHEW HAD SIX ARMS AND THREE NUTS.'],
  ["YOUR NEPHEW HAD SIX ARMS. I'VE HAD WORSE DAYS. TODAY, ACTUALLY."],
  ['YOUR NEPHEW HAD SIX ARMS AND STILL LESS GOING ON THAN ME.'],
);
export const GUP_INTRO2 = bp(
  ["HE WAS ALSO MY SON! IT'S COMPLICATED! ADULT SWIM! TWEEEET!"],
  ["HE WAS ALSO MY SON! IT'S COMPLICATED! YOU'RE GOING IN THE POOL AND STAYING THERE! TWEEEET!"],
  ["HE WAS ALSO MY SON! IT'S COMPLICATED! COVER THAT UP AND DIE! TWEEEET!"],
);
export const GUP_RETRY = bp(
  ['TWEEEET! BACK IN THE POOL! NO REFUNDS!', 'YOU AGAIN! ADULT SWIM!'],
  ['TWEEEET! THE STINKY ONE AGAIN! NO REFUNDS!', 'YOU AGAIN! NOW THE POOL NEEDS SHOCKING!'],
  ['TWEEEET! THE NAKED ONE AGAIN! NO REFUNDS!', 'YOU AGAIN! COVER UP!'],
);
/** In the shallow end: the owner's ("come back to the deep end, pussy"), and his variants. */
export const GUP_TAUNT = bp(
  ['COME BACK TO THE DEEP END, PUSSY!', 'THE SHALLOW END IS FOR BABIES! COME BACK, PUSSY!', 'WADING POOL! WADING POOL! COME BACK TO THE DEEP END, PUSSY!', "YOU CAN'T TOUCH BOTTOM OUT HERE! THAT'S THE POINT, PUSSY!", 'FLOATIES! GET THE PUSSY SOME FLOATIES!'],
  ['COME BACK TO THE DEEP END, PUSSY! THE SHIT CAN SWIM!', 'THE SHALLOW END IS FOR BABIES! AND YOU SMELL LIKE ONE! COME BACK, PUSSY!', 'COME BACK TO THE DEEP END, PUSSY! IT HIDES THE BROWN!', "WADING IN YOUR OWN SHIT! COME BACK TO THE DEEP END, PUSSY!", 'SWIM DIAPER! GET THE PUSSY A SWIM DIAPER!'],
  ['COME BACK TO THE DEEP END, PUSSY! IT HIDES THE SHRINKAGE!', 'THE SHALLOW END IS FOR BABIES! AND YOURS IS A BABY! COME BACK, PUSSY!', 'COME BACK TO THE DEEP END, PUSSY! NOBODY CAN SEE IT OUT HERE!', 'NAKED IN THE KIDDIE END! COME BACK TO THE DEEP END, PUSSY!', 'FLOATIES! THE NAKED PUSSY NEEDS FLOATIES!'],
);
/** The mutters (erratic: giggling, screaming, the whistle at nothing). */
export const GUP_PATTER = bp(
  ['TWEET! TWEET! TWEET! HEE HEE!', 'THIRTY MINUTES AFTER EATING! I ATE YOU! IN MY HEAD!', 'I SEE YOU! I SEE EVERYTHING! I HAVE FOUR EYES!', "NOBODY'S DROWNED ON MY WATCH! I WATCH THEM DO IT!", 'ADULT SWIM! ADULT SWIM! ADUUULT SWIIIIM!'],
  ['TWEET! TWEET! CODE BROWN! CODE BROWN! HEE HEE!', "THE POOL'S CLOSED! YOU MADE IT CLOSED!", 'I SEE A FLOATER! IT HAS A FACE!', 'THIRTY MINUTES AFTER EATING! THIRTY YEARS AFTER YOU!', 'SHOCK THE POOL! SHOCK IT! SHOCK HIM!'],
  ['TWEET! TWEET! NO NUDITY! NO NUDITY! HEE HEE!', 'I SEE IT! I SEE IT WITH ALL FOUR EYES!', "NAKED IN MY POOL! THE CHLORINE'S GONNA FIND YOUR CRACK!", 'THIRTY MINUTES AFTER EATING! YOU LOOK UNDERCOOKED!', 'TOWEL! SOMEBODY THROW HIM A TOWEL! A BIG ONE! NO, A SMALL ONE!'],
);
/** As he blows for a big wave. */
export const GUP_WAVE = bp(['WAVE TIME! TWEEEEEET!', 'SURF\'S UP, PUSSY!'], ['WAVE TIME! WASH THE SHIT OFF! TWEEEET!', 'SURF\'S UP, STINKY!'], ['WAVE TIME! TWEEEET! HOLD ONTO IT!', 'SURF\'S UP, NAKED!']);
export const GUP_HURT = bp(
  ['OW! FOUL! FOUL!', 'TWEET! THAT\'S A PENALTY!', 'NO HORSEPLAY!', 'I\'M TELLING THE MANAGER! I\'M THE MANAGER!'],
  ['OW! YOU GOT SHIT IN MY GILLS!', 'TWEET! PENALTY! HYGIENE PENALTY!', 'NO HORSEPLAY! NO POOPING!'],
  ['OW! NO NUDE HORSEPLAY!', 'TWEET! PENALTY! INDECENT EXPOSURE!', "IT TOUCHED ME! YOUR THING TOUCHED ME!"],
);
export const GUP_LOW = bp(
  ["I CAN'T SWIM! I'M A LIFEGUARD AND I CAN'T SWIM! I NEVER COULD!"],
  ["I CAN'T SWIM! NEVER COULD! AND NOW THE POOL'S BROWN!"],
  ["I CAN'T SWIM! NEVER COULD! AND NOW THERE'S A NAKED MAN IN IT!"],
);
/** His last (it goes sideways: the whistle). */
export const GUP_DEATH = bp(["TWEE... TWEEEE... HELP! LIFEGUARD! WHERE'S THE LIFEGUARD?!"], ['TWEE... TWEEE... HELP! HE POOPED AND NOW I\'M DYING!'], ["TWEE... TWEEE... HELP! THE LAST THING I SAW WAS HIS DICK!"]);
/** Meathead, over him floating (the drain about to go). */
export const MH_GUP_DEAD = bp(['ADULT SWIM IS OVER.', "EVERYBODY OUT OF THE POOL. HE'S IN IT."], ["ADULT SWIM IS OVER. SOMEBODY SHOCK THE POOL.", "EVERYBODY OUT. THAT BROWN ISN'T HIM."], ['ADULT SWIM IS OVER. NUDE SWIM IS ALL DAY.', 'EVERYBODY OUT. THE NAKED GUY WON.']);
/** The drain opening under him: down he goes (a scream, a line), out the other end. */
export const MH_DRAIN = bp(['THE DRAIN! WHO PULLED THE PLUG?!'], ['THE DRAIN! FINALLY SOMETHING FLUSHES ME!'], ['THE DRAIN! KEEP EVERYTHING TUCKED!']);
/** Grabbing at him (too big, too slimy). */
export const GRAB_GUP = ["HE'S TOO SLIPPERY. HE'S LIKE A WET HOT DOG.", "TOO BIG. TOO GREASY. TOO MANY NIPPLES.", "I'M NOT GRABBING THAT. IT'S MOIST."];

// ---------------------------------------------------------------------------------------------------------------
// What hurts him here: the callouts, and the death screen (one line, short)

export const HURT3: Record<string, { hurt: string[]; death: string[] }> = {
  'm2:wp3_piss': { hurt: ['PEE! I FELL IN THE PEE!', "IT'S WARM! WHY IS IT WARM?!", 'IN MY MOUTH! IT GOT IN MY MOUTH!'], death: ['DROWNED IN THE PISS FILTER', 'ONE WITH THE PARK'] },
  'm2:wp3_sludge': { hurt: ["IT'S EATING MY FEET!", 'CHEMICALS! HOT CHEMICALS!', 'MY SKIN! IT BURNS!'], death: ['DISSOLVED IN SLUDGE', 'PRODUCT OF ???'] },
  'm2:wp3_spurt': { hurt: ['THE PEE SPURTED UP AT ME!', 'A PEE GEYSER! IN MY EYES!', 'IT SQUIRTED ME!'], death: ['SPRAYED BY THE PISS FILTER', 'PEED ON TO DEATH'] },
  'm2:wp3_gas': { hurt: ['THE GAS! MY EYES!', 'CHLORINE! I CAN TASTE IT!', 'IT BURNS MY NOSE HAIRS!'], death: ['GASSED BY CHEAP CHLORINE', 'INHALED (TOO MUCH)'] },
  'm2:wp3_zap': { hurt: ['THE PUDDLE! IT ZAPPED ME!', 'WET FLOOR! LIVE WIRE!', 'MY TEETH ARE BUZZING!'], death: ['ELECTROCUTED IN A PUDDLE', 'SHOULD HAVE READ WET FLOOR'] },
  'm2:wp3_steam': { hurt: ['STEAM! MY FACE!', "IT'S COOKING ME!", 'MOSTLY OFF MY ASS!'], death: ['STEAMED LIKE A HOT DOG', 'MOSTLY OFF, MY ASS'] },
  'm2:wp3_fan': { hurt: ['THE FAN! IT CHOPPED ME!', 'BLADES! UNDERWATER BLADES!', 'GET AWAY FROM THE FAN!'], death: ['BLENDED BY A FAN', 'CHOPPED UNDERWATER'] },
  'm2:wp3_bleach': { hurt: ['BLEACH IN THE WATER! MY EYES!', "IT'S BLEACHING MY ASSHOLE!", 'THE WATER BURNS!'], death: ['BLEACHED TO DEATH', 'CLEANER THAN EVER'] },
  'm2:wp3_drown': { hurt: ['GLUB! GLUB!', 'NO AIR! NO AIR!', 'I SWALLOWED A PIPE!'], death: ['DROWNED IN A PIPE', 'DROWNED IN THE PLUMBING'] },
  'm2:wp3_janitor': { hurt: ['THE MOP! RIGHT IN THE FACE!', 'A POSSESSED JANITOR HIT ME!', 'GET YOUR MOP OFF ME!'], death: ['MOPPED UP', 'KILLED BY A JANITOR'] },
  'm2:wp3_bucket': { hurt: ['MOP WATER! IN MY MOUTH!', 'HE THREW THE BUCKET AT ME!', 'DIRTY WATER! DIRTIER THAN ME!'], death: ['DROWNED IN A MOP BUCKET', 'DONE IN BY DIRTY WATER'] },
  'm2:wp3_tech': { hurt: ['A WRENCH! TO THE HEAD!', 'THE TECH HIT ME!', 'HE ZAPPED ME WITH HIS PROD!'], death: ['FIXED BY A TECHNICIAN', 'WRENCHED'] },
  'm2:wp3_fuse': { hurt: ['A FUSE! IT BLEW UP ON ME!', 'SPARKS! IN MY HAIR!', 'HE THREW ELECTRICITY AT ME!'], death: ['BLOWN LIKE A FUSE', 'SHORTED OUT'] },
  'm2:wp3_grub': { hurt: ['SOMETHING FELL ON ME! IT BIT ME!', 'A GRUB! ON MY HEAD!', "IT'S SLIMY AND IT BITES!"], death: ['EATEN BY A GRUB', 'SLIMED TO DEATH'] },
  'm2:wp3_eel': { hurt: ['AN EEL! IT BIT ME!', 'SPACE EEL! IN THE PIPE!', 'GET OFF MY LEG!'], death: ['EATEN BY A SPACE EEL', 'EELED'] },
  'm2:wp3_gupwave': { hurt: ['THE WAVE! IT SLAMMED ME!', 'WIPEOUT!', 'TOO MUCH WAVE!'], death: ['WIPED OUT', 'DONE IN BY A WAVE'] },
  'm2:wp3_loogie': { hurt: ['HE SPAT ON ME!', 'ALIEN SNOT! IT BURNS!', 'A LOOGIE! A GREEN ONE!'], death: ['HOCKED TO DEATH', 'DIED IN A LOOGIE'] },
  'm2:wp3_slick': { hurt: ['THE SNOT SLICK! IT BURNS!', 'I SWAM INTO HIS SNOT!', 'GREEN WATER! GREEN WATER!'], death: ['SWAM IN ALIEN SNOT', 'DISSOLVED IN BOOGERS'] },
  'm2:wp3_flop': { hurt: ['BELLY FLOP! ON ME!', 'HE LANDED ON ME!', "HE'S SO HEAVY!"], death: ['BELLY FLOPPED ON', 'CRUSHED BY A LIFEGUARD'] },
  'm2:wp3_breach': { hurt: ['HE CAME UP UNDER ME!', 'HE BIT ME FROM BELOW!', 'JAWS! ALIEN JAWS!'], death: ['EATEN FROM BELOW', 'JAWSED'] },
  'm2:wp3_gup': { hurt: ['HE BUMPED ME! WITH HIS GUT!', 'GET YOUR GUT OFF ME!', "HE'S SLIMY!"], death: ['KILLED BY A LIFEGUARD', 'GUTTED BY GUPPLAX'] },
};

// ---------------------------------------------------------------------------------------------------------------

const all = (...pools: (string | string[] | ByPants)[]) => pools.flatMap(p => (typeof p === 'string' ? [p] : Array.isArray(p) ? p : Object.values(p).flat()));
export const PARK3_VOICE_LINES: Record<string, string[]> = {
  meathead: all(MH_DOOR3, MH_IN, MH_PISS, MH_CHEM, MH_GANG, MH_SHAFT, MH_SWIM, MH_VALVE, MH_PUSHED, MH_PUMP, MH_AIR_LOW, MH_FLUSHED, MH_GUP, MH_GUP_DEAD, MH_DRAIN, GRAB_GUP, ...Object.values(HURT3).map(h => h.hurt)),
  death: all(...Object.values(HURT3).map(h => h.death)),
  [GUP_VOICE]: all(GUP_INTRO, GUP_INTRO2, GUP_RETRY, GUP_TAUNT, GUP_PATTER, GUP_WAVE, GUP_HURT, GUP_LOW, GUP_DEATH),
  [STAFF_VOICE.m]: all(STAFF_BARK), [STAFF_VOICE.f]: all(STAFF_BARK),
};
