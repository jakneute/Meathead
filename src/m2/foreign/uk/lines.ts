// What's said in the United Kingdom (the PA's hello, his lines, the cast's barks, what hurts him here), by voice.

import { pavilionVoices, type ByPants, type PavilionTalk, type HurtTable } from '../talk';

export const V = {
  guard: { m: 'm2.foreign.guard', f: 'm2.foreign.guardf' },
  hooligan: { m: 'm2.foreign.hooligan', f: 'm2.foreign.hooliganf' },
  tealady: { m: 'm2.foreign.tealady', f: 'm2.foreign.tealady' },
  bobby: { m: 'm2.foreign.bobby', f: 'm2.foreign.bobbyf' },
};

export const TALK: PavilionTalk = {
  pa: {
    clean: [
      'CHEERIO AND WELCOME TO THE UNITED KINGDOM! ENGLAND! BRITAIN! LONDON! IT IS ALL ONE PLACE!',
      'NOW ENTERING THE U.K.! WE BEAT THEM ONCE! PLEASE BE NICE ABOUT IT!',
    ],
    shitty: [
      'WELCOME TO THE U.K.! SIR, THE FOG MACHINE CANNOT COVER THAT.',
      'NOW ENTERING LONDON! SIR, PLEASE MIND THE GAP. AND THE STAIN.',
    ],
    nude: [
      'WELCOME TO THE U.K.! SIR, IT IS COLD AND DAMP HERE. WE CAN TELL.',
      'NOW ENTERING LONDON! SIR, THE GUARDS ARE TRAINED NOT TO REACT. THEY ARE REACTING.',
    ],
  },
  arrive: [
    "ENGLAND. THE COUNTRY WE BEAT. IT'S FOGGY AND EVERYBODY'S DRUNK.",
    "LONDON. RED PHONE BOOTHS. NOBODY'S USED ONE SINCE 1990.",
  ],
  gags: [
    { from: 100, to: 600, key: 'guards', lines: ["THOSE GUARDS DON'T MOVE. I COULD TEABAG ONE.", "BIG FUZZY HATS. THEY DON'T EVEN BLINK."] },
    { from: 600, to: 2000, key: 'bus', lines: ["A DOUBLE-DECKER BUS. IT'S A BUS WITH A BUS ON IT.", "THEY DRIVE ON THE WRONG SIDE. RIGHT AT ME."] },
    { from: 2000, to: 2350, key: 'pub', lines: ['A PUB. FINALLY, A COUNTRY THAT GETS IT.', 'WARM BEER. THAT EXPLAINS A LOT.'] },
    { from: 2350, to: 3050, key: 'bridge', lines: ['A BRIDGE THAT GOES UP. A BRIDGE THAT QUITS ON YOU.', 'LONDON BRIDGE. IS IT FALLING DOWN? COME ON. FALL DOWN.'] },
    // (job 4b: the world's tallest phone box)
    { from: 3700, to: 3920, key: 'bigben', lines: ["THE WORLD'S TALLEST PHONE BOOTH. STILL SMELLS LIKE PISS.", 'THE EXIT IS OUT THE TOP. OSHA WOULD SHIT.'] },
    { from: 3920, to: 4280, key: 'inside', lines: ["THE INSIDE OF A PHONE BOOTH. IT'S ALL STAIRS AND A BIG SWINGING PHONE.", 'SOMEBODY LEFT IT OFF THE HOOK. SOMEBODY HUGE.'], minH: 100 },
    { from: 4280, to: 4420, key: 'face', lines: ["I'M CLIMBING OUT OF A PHONE BOOTH. NINE STORIES UP.", "THE WHOLE PARK'S DOWN THERE. IT LOOKS SMALLER. STILL SUCKS."], minH: 780 },
  ],
};

/** A bobby up top as the giant phone starts rattling (the bobby voices). */
export const RINGING: ByPants = {
  clean: ["IT'S RINGING, INNIT! COVER YOUR EARS! I'M FROM TOLEDO!", "DON'T ANSWER IT! IT'S NEVER GOOD NEWS!", "MIND THE PHONE! I'M ON HOLD WITH MY UNION!"],
  shitty: ["THE RING'S GONNA SHAKE IT RIGHT OUT OF YOU, MATE!", "IT'S THE COUNCIL! THEY'RE CALLING ABOUT THE SMELL!"],
  nude: ["OI! NO NAKED BLOKES IN THE PHONE BOX! WE GET ENOUGH OF THAT!", "IT'S FOR YOU! IT'S YOUR MUM! SHE CAN SEE YOU!"],
};

/** Him, answering the giant phone as it rings (once). */
export const ANSWER = ["HELLO? NO, I DON'T WANNA TAKE A SURVEY. EAT ME.", 'HELLO? NO. HE DIED. STOP CALLING.', "HELLO? I DON'T WANT A FUCKING WARRANTY."];

export const GUARD: ByPants = {
  clean: ["NOW YOU'VE DONE IT! I'M ALLOWED TO MOVE NOW!", "I'M TYLER! I STOOD THERE SIX HOURS! YOU SHOT ME!", 'GOD SAVE THE... WHOEVER IT IS NOW!'],
  shitty: ["I STOOD STILL THROUGH THAT SMELL! THAT'S DISCIPLINE!", "NO PISS BREAK IN SIX HOURS AND YOU'RE THE ONE WHO SHAT!"],
  nude: ["I DIDN'T FLINCH AT THAT! THAT'S HOW GOOD I AM!", "I SAW EVERYTHING AND I DIDN'T BLINK! I'M BLINKING NOW!"],
};
export const HOOLIGAN: ByPants = {
  clean: ["OI! OI! OI! THAT'S ALL I KNOW!", "I'VE HAD NINE PINTS! ON MY LUNCH BREAK!", 'HAVE A PINT! IN YOUR FACE!'],
  shitty: ["OI! HE'S SHAT HIMSELF! LIKE AN AWAY FAN!", 'SMELLS LIKE THE STADIUM TOILETS! AT HALFTIME!'],
  nude: ['OI! STREAKER! STREAKER ON THE PITCH!', 'GET HIM OFF THE FIELD! THERE IS NO FIELD! GET HIM!'],
};
export const TEALADY: ByPants = {
  clean: ['TEA, LOVE? IT IS VERY HOT! HERE!', "I MAKE IT IN THE MICROWAVE! DON'T TELL, LOVE!", 'ONE LUMP OR TWO? LUMPS! ON YOUR HEAD!'],
  shitty: ['OH, YOU POOR DEAR. YOU NEED A BATH. AND A HOSE.', 'NOT IN MY TEA SHOPPE, YOU FILTHY BOY!'],
  nude: ['OH! OH MY! PUT THE KETTLE DOWN! I MEAN, PUT IT AWAY!', 'I HAVE NOT SEEN ONE OF THOSE SINCE THE WAR! WHICH WAR? ANY WAR!'],
};
export const BOBBY: ByPants = {
  clean: ["ELLO ELLO ELLO! WHAT'S ALL THIS THEN?", "I'M A COP! A BOBBY! I DON'T GET A GUN! JUST THE STICK!", 'MOVE ALONG! MOVE ALONG! WITH MY STICK!'],
  shitty: ["YOU'RE NICKED! FOR THE SMELL!", "ELLO ELLO ELLO! WHAT'S ALL THIS IN YOUR PANTS?"],
  nude: ["YOU'RE NICKED FOR INDECENCY! PUT YOUR HANDS... NOT THERE!", 'COVER YOURSELF, SIR! WITH MY HAT IF YOU HAVE TO!'],
};

export const HURT: HurtTable = {
  'm2:fl_guard': {
    hurt: ['THE GUARD MOVED! HE MOVED AND HE HIT ME!', 'OW! THE BAYONET!', 'BIG HAT HITS HARD!'],
    death: ['KILLED BY A GUARD. HE MOVED.', 'BAYONETED'],
  },
  'm2:fl_hooligan': {
    hurt: ['THE HOOLIGAN HEADBUTTED ME!', "HE BIT MY EAR! HE'S HAMMERED!", 'HE PUNCHED ME AND SANG!'],
    death: ['HOOLIGANED', 'STOMPED BY A SOCCER FAN'],
  },
  'm2:fl_pint': {
    hurt: ['A PINT! HE THREW A FULL PINT!', 'OW! WARM BEER IN MY EYES!', "WHAT A WASTE OF BEER!"],
    death: ['PINTED', 'DEATH BY WARM BEER'],
  },
  'm2:fl_tealady': {
    hurt: ['THE TEA LADY HIT ME WITH THE POT!', 'GRANNY GOT ME IN THE BALLS!', 'GRANNY! STOP IT!'],
    death: ['KILLED BY A TEA LADY', 'STEEPED'],
  },
  'm2:fl_tea': {
    hurt: ["HOT TEA! IT'S HOT TEA!", 'IT BURNS! IT BURNS LIKE TEA!', "THAT'S BOILING! SHE THREW BOILING!"],
    death: ['SCALDED BY TEA', 'BREWED TO DEATH'],
  },
  'm2:fl_bobby': {
    hurt: ['THE COP HIT ME WITH A STICK!', 'OW! THE TRUNCHEON! THE TRUNCHEON!', 'POLICE BRUTALITY! BRITISH STYLE!'],
    death: ['NICKED', 'BEATEN BY A BOBBY'],
  },
  'm2:fl_bus': {
    hurt: ['THE BUS HIT ME! ON THE WRONG SIDE!', "OW! IT DIDN'T EVEN STOP!", 'A BUS! A TWO-STORY BUS!'],
    death: ['HIT BY A BUS', 'WRONG SIDE OF THE ROAD'],
  },
  'm2:fl_handset': {
    hurt: ['THE PHONE HIT ME! THE TALKING PART!', 'OW! RIGHT IN THE TEETH! WITH A PHONE!', 'WHO LEFT IT OFF THE FUCKING HOOK?!'],
    death: ['HUNG UP ON', 'KILLED BY A LANDLINE'],
  },
  'm2:fl_ring': {
    hurt: ['THE RING! MY EARS! MY EVERYTHING!', "IT'S RINGING! IT'S RINGING INSIDE MY SKULL!", 'ANSWER THE FUCKING PHONE!'],
    death: ['DISCONNECTED', 'RUNG TO DEATH'],
  },
};

export const VOICE_LINES = pavilionVoices(TALK, HURT, [[V.guard, GUARD], [V.hooligan, HOOLIGAN], [V.tealady, TEALADY], [V.bobby, BOBBY], [{ m: V.bobby.m, f: V.bobby.m }, RINGING]], { meathead: ANSWER });
