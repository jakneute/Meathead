// What's said in Norway (the PA's hello, his lines, the cast's barks, what hurts him here), by voice.

import { pavilionVoices, allOf, type ByPants, type PavilionTalk, type HurtTable } from '../talk';

export const V = {
  viking: { m: 'm2.foreign.viking', f: 'm2.foreign.vikingf' },
  shield: { m: 'm2.foreign.shieldviking', f: 'm2.foreign.shieldvikingf' },
  lutefisk: { m: 'm2.foreign.lutefisk', f: 'm2.foreign.lutefisk' },
};

export const TALK: PavilionTalk = {
  pa: {
    clean: [
      'WELCOME TO NORWAY! HOME OF THE VIKINGS! THE FOOTBALL TEAM! AND ALSO SOME OLD ONES!',
      'NOW ENTERING NORWAY! TRY A FREE SAMPLE OF LUTEFISK! LEGALLY, WE HAVE TO OFFER IT.',
    ],
    shitty: [
      'WELCOME TO NORWAY! SIR, PLEASE DO NOT SIT IN THE VIKING SHIP. IT IS A RENTAL.',
      "NOW ENTERING NORWAY! SIR, WE'VE HAD A COMPLAINT ABOUT YOUR SMELL. FROM THE LUTEFISK.",
    ],
    nude: [
      'WELCOME TO NORWAY! IT IS VERY COLD HERE, SIR. WE CAN ALL TELL.',
      'NOW ENTERING NORWAY! SIR, PLEASE STOW YOUR LITTLE LONGBOAT.',
    ],
  },
  arrive: [
    'NORWAY. CAPITAL OF SWEDEN. SURE.',
    'VIKINGS. HORNED HELMETS FROM PARTY CITY. HISTORY.',
  ],
  gags: [
    { from: 1050, to: 1500, key: 'troll', lines: ['A TROLL. HE LOOKS LIKE MY UNCLE.', 'HIS NOSE IS A BALLSACK. SOMEBODY GOT FIRED FOR THAT.'] },
    { from: 1550, to: 1900, key: 'lutefisk', lines: ['LUTEFISK. FISH JELLY. WHO DID THIS TO A FISH?', 'FREE SAMPLES. NO REFUNDS. NO SHIT.'] },
    { from: 1900, to: 2400, key: 'fjord', lines: ["A FJORD. IT'S A WAVE POOL WITH A BAND-AID FLOATING IN IT.", 'A VIKING SHIP. MADE IN TAIWAN.'] },
    { from: 2900, to: 3400, key: 'church', lines: ['A WOODEN CHURCH WITH DRAGONS ON IT. FINALLY, A RELIGION I GET.', "A STAVE CHURCH. I DON'T KNOW WHAT A STAVE IS."] },
    // (job 4b: the troll toll bridge)
    { from: 3900, to: 4200, key: 'giants', lines: ["NOW THAT'S A TROLL. HE'S HOLDING A BRIDGE ON HIS HEAD. RESPECT.", 'GIANT TROLLS. SMOOTH AS A KEN DOLL DOWN THERE.'] },
    { from: 4300, to: 4740, key: 'toll', lines: ["A TOLL. I DON'T PAY TOLLS. I DON'T EVEN PAY TAXES.", "FIVE BUCKS TO CROSS A PLANK. I'LL PAY IN TEETH. YOURS."], minH: 380 },
    { from: 4400, to: 4900, key: 'river', lines: ["THERE'S A HAND IN THE RIVER. THE TROLL'S UNDER THE BRIDGE. OF COURSE HE IS.", "SOMETHING TOUCHED MY LEG. I'M NOT ASKING."], maxH: 40 },
  ],
};

/** The toll gang's demand, up on the bridge (a viking's voice). */
export const TOLL: ByPants = {
  clean: ["TROLL TOLL! FIVE BUCKS OR YOUR LIFE! MOSTLY YOUR LIFE!", "NOBODY CROSSES FOR FREE! IT'S IN THE SAGAS! PROBABLY!"],
  shitty: ["TOLL'S FIVE BUCKS! TEN FOR YOU! YOU'RE GONNA STINK UP THE BRIDGE!", 'YOU CAN PAY IN CASH! NOT IN WHATEVER THAT IS!'],
  nude: ["TOLL'S FIVE BUCKS! WHERE ARE YOU EVEN KEEPING FIVE BUCKS?!", "NO SHIRT, NO PANTS, NO BRIDGE!"],
};
/** The gang dead, the gate going up. */
export const PAID_GAG = ['TOLL PAID. IN VIKINGS.', "THAT'S THE MOST I'VE EVER PAID FOR A BRIDGE.", 'KEEP THE CHANGE. THE CHANGE IS YOUR TEETH.'];

export const VIKING: ByPants = {
  clean: ["SKOL! THAT'S ALL I KNOW! SKOL!", "I'M TYLER! MY GREAT-GRANDMA WAS NORWEGIAN! OR DUTCH!"],
  shitty: ["BY ODIN'S BEARD, YOU STINK! THAT'S A REAL SAYING!", 'YOU SMELL LIKE A LONGBOAT LATRINE!'],
  nude: ['A BERSERKER! THEY FOUGHT NAKED! I READ THAT ON A NAPKIN!', 'VALHALLA HAS A DRESS CODE, DUDE!'],
};
export const SHIELD: ByPants = {
  clean: ["SHIELD WALL! IT'S JUST ME! I'M THE WALL!", "THIS SHIELD'S FROM A PARTY STORE! IT STILL HURTS!"],
  shitty: ['SHIELD UP! NOT FOR YOU! FOR THE SMELL!', "IT'S PLASTIC! IT'S NOT STOPPING THAT SMELL!"],
  nude: ["I'M NOT LOWERING THIS SHIELD! I DON'T WANNA SEE IT!", 'IT LOOKS LIKE A SAD LITTLE MUSHROOM!'],
};
export const LUTEFISK: ByPants = {
  clean: ['FREE SAMPLE! PLEASE! NOBODY EVER TAKES ONE!', "IT'S LUTEFISK! IT'S FISH SOAKED IN LYE! YUM!"],
  shitty: ['OH NO, HONEY, YOU ALREADY HAD SOME!', 'THE LUTEFISK DOES THAT TO EVERYBODY, SWEETIE!'],
  nude: ["OH, HONEY. IT'S COLD IN HERE. I'M SURE IT'S BIGGER USUALLY.", 'OH MY! WELL, THE LUTEFISK IS FIRMER THAN THAT!'],
};

export const HURT: HurtTable = {
  'm2:fl_viking': {
    hurt: ['THE VIKING HIT ME!', 'OW! YOU MINNESOTA FUCK!', 'SKOL YOURSELF, DICKHEAD!'],
    death: ['PILLAGED', 'SENT TO VALHALLA, OHIO'],
  },
  'm2:fl_viking_axe': {
    hurt: ['AN AXE! A REAL AXE!', 'HE TOOK SOME SCALP!', 'WHO GIVES THE INTERN AN AXE?!'],
    death: ['AXED', 'SPLIT LIKE FIREWOOD'],
  },
  'm2:fl_viking_horns': {
    hurt: ['HORNS! RIGHT IN MY ASS!', 'I DIVE KICKED A HORN!', 'THE HELMET HAS POINTS!'],
    death: ['IMPALED ON A FAKE HELMET', 'HORNED'],
  },
  'm2:fl_shieldviking': {
    hurt: ['SHIELD BASH! RIGHT IN THE TEETH!', 'THE WALL HIT ME!', 'SHIELD BASH! RIGHT IN THE NUTS!'],
    death: ['A SHIELD WALL OF ONE', 'WALLED IN'],
  },
  'm2:fl_lutefisk': {
    hurt: ['SHE HIT ME WITH THE TRAY!', "THE FISH LADY'S STRONG!", 'THE SAMPLE LADY KNOCKED MY TOOTH OUT!'],
    death: ['KILLED BY A SAMPLE LADY', 'FREE SAMPLE OF DEATH'],
  },
  'm2:fl_wave': {
    hurt: ['THE WAVE MACHINE! IN MY NOSE!', 'FUCKING WAVE POOL!', 'I SWALLOWED THE FJORD!'],
    death: ['DROWNED IN A WAVE POOL', 'THE FJORD TOOK HIM'],
  },
  // (out of air, in any of the land's water (air.ts): Norway's table carries it for the whole land)
  'm2:fl_drown': {
    hurt: ["CAN'T BREATHE!", 'AIR! AIR!', 'GLUB! GLUB!', 'WATER IN MY LUNGS!'],
    death: ['DROWNED IN A THEME PARK', 'FORGOT TO BREATHE', 'DIED IN INTERNATIONAL WATERS', 'GLUB GLUB GLUB'],
  },
  'm2:fl_lutefisk_fish': {
    hurt: ['LUTEFISK! IN MY MOUTH!', 'IT TASTES LIKE A FOOT!', "I'M GONNA PUKE!"],
    death: ['DROWNED IN FISH JELLY', 'DIED OF LUTEFISK'],
  },
  'm2:fl_troll_hand': {
    hurt: ['THE TROLL GRABBED MY ASS!', 'A HAND! IN THE RIVER! FUCK!', 'OW! TROLL KNUCKLES!'],
    death: ['TAKEN BY THE BRIDGE TROLL', "SHOULD'VE PAID THE TOLL"],
  },
};

// ---------------------------------------------------------------------------------------------------------------
// THE DOORMAN (valhalla.ts): a park guy in a cheaper troll suit down under the bridge's right end, who wants the blood
// of every Norwegian cosplayer before he'll raise the HALLS OF VALHALLA (CON-FUCK-TIOUS's hideout under the bridge).
// Bored, by the book, muffled through a foam head. His voice: cast.json's m2.foreign.doorman.

export const DOORMAN_VOICE = 'm2.foreign.doorman';
/** The first time he's talked to: what he wants. */
export const DOOR_DEMAND: ByPants = {
  clean: [
    'HALT. TO ENTER THE HALLS OF VALHALLA, BRING ME THE BLOOD OF EVERY NORWEGIAN COSPLAYER. EVERY ONE. MANAGEMENT IS VERY CLEAR.',
    'HALT, MORTAL. THE HALLS OF VALHALLA OPEN FOR THE BLOOD OF EVERY NORWEGIAN COSPLAYER. I JUST WORK THE DOOR.',
  ],
  shitty: [
    "HALT. THE HALLS OF VALHALLA WANT THE BLOOD OF EVERY NORWEGIAN COSPLAYER. NOT WHATEVER'S COMING OUT OF YOUR PANTS.",
    'HALT, MORTAL. BRING ME THE BLOOD OF EVERY NORWEGIAN COSPLAYER. AND STAND DOWNWIND OF ME WHILE YOU DO IT.',
  ],
  nude: [
    'HALT. THE HALLS OF VALHALLA WANT THE BLOOD OF EVERY NORWEGIAN COSPLAYER. THEY HAVE NOT ASKED FOR THAT. PUT IT AWAY.',
    "HALT, MORTAL. BRING ME THE BLOOD OF EVERY NORWEGIAN COSPLAYER. THERE'S NO DRESS CODE. CLEARLY.",
  ],
};
/** Meathead, told. */
export const DOOR_DEMAND_MH: ByPants = {
  clean: ['KILL EVERY VIKING IN NORWAY? I WAS GONNA DO THAT FOR FREE.', 'ALL OF THEM? EVEN THE FISH LADY? FINE. ESPECIALLY THE FISH LADY.'],
  shitty: ["BLOOD? SURE. I'M ALREADY LEAKING EVERYTHING ELSE.", "ALL OF THEM. GOT IT. THEY'LL SMELL ME COMING."],
  nude: ['ALL OF THEM? NAKED? LIKE A BERSERKER? HELL YES.', "EVERY VIKING IN NORWAY. I'LL GO AS I AM."],
};
/** Talked to before they're all dead: still thirsty (then how many are left: DOOR_COUNT). */
export const DOOR_LEFT: ByPants = {
  clean: ['THE HALLS ARE STILL THIRSTY.', "NOT YET. SOME OF THEM ARE STILL BREATHING. I CAN HEAR THEM VAPING.", "NO BLOOD, NO VALHALLA. I DON'T MAKE THE RULES. ODIN DOES. ODIN IS GARY FROM HR."],
  shitty: ["NOT YET. AND YOU CAN'T COME IN SMELLING LIKE THAT EITHER. BUT MOSTLY THE BLOOD THING.", 'THE HALLS WANT BLOOD. YOU KEEP BRINGING ME... THAT.', 'STILL THIRSTY. THE HALLS. NOT ME. I LOST MY APPETITE WHEN YOU WALKED UP.'],
  nude: ['NOT YET. AND THE HALLS HAVE SEEN ENOUGH OF YOU ALREADY.', 'MORE BLOOD. LESS DICK.', "STILL THIRSTY. GO. AND DON'T SLIP. NOT IN THAT OUTFIT."],
};
const NUM = ['ZERO', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN', 'TWENTY'];
/** How many are left (n, from 1): the count after DOOR_LEFT. Past twenty, the last one. */
export const DOOR_COUNT: string[] = [
  'ONE COSPLAYER STILL BREATHING. ONE. FIND HIM.',
  ...NUM.slice(2).map(w => `${w} COSPLAYERS STILL BREATHING.`),
  'MORE THAN TWENTY STILL BREATHING. I STOPPED COUNTING.',
];
export const doorCount = (n: number) => DOOR_COUNT[Math.max(0, Math.min(DOOR_COUNT.length - 1, n - 1))];
/** All dead, talked to: he raises the halls. */
export const DOOR_RAISE: ByPants = {
  clean: ["THE BLOOD IS PAID. RISE, HALLS OF VALHALLA! ...IT'S ON A HYDRAULIC LIFT. GIVE IT A SECOND.", "ALL OF THEM? JESUS. OKAY. RISE, HALLS OF VALHALLA! ...THERE'S A BUTTON."],
  shitty: ['THE BLOOD IS PAID. RISE, HALLS OF VALHALLA! WIPE YOUR FEET. AND EVERYTHING ELSE.', 'ALL OF THEM. IN THOSE PANTS. RISE, HALLS OF VALHALLA! THE FOG MACHINE IS FOR YOU.'],
  nude: ['THE BLOOD IS PAID. RISE, HALLS OF VALHALLA! ...COME ON. IT STICKS IN THE COLD. LIKE YOU.', 'ALL OF THEM, NAKED. RESPECT. RISE, HALLS OF VALHALLA!'],
};
/** Meathead, at the halls coming up out of the river. */
export const DOOR_RAISE_MH: ByPants = {
  clean: ['VALHALLA! IT LOOKS LIKE A HAUNTED HOUSE AT A CHURCH CARNIVAL!', 'VALHALLA! IT CAME UP OUT OF THE RIVER! LIKE A VIKING SUBMARINE!'],
  shitty: ['VALHALLA! I HOPE THEY HAVE A BATHROOM IN THERE!', 'VALHALLA! WARRIORS DIE AND GO THERE! I ONLY HALF DIED!'],
  nude: ['VALHALLA! I HOPE THERE IS A COAT CHECK! FOR MY COAT! WHICH I DO NOT HAVE!', 'VALHALLA! I CAME DRESSED FOR IT!'],
};
/** Talked to once it's up: in you go. */
export const DOOR_OPEN: ByPants = {
  clean: ["IN YOU GO. THE GUY IN THERE BROUGHT HIS OWN PROTEIN POWDER. HE WON'T LEAVE.", 'ENTER, WORTHY ONE. MIND THE FOG MACHINE. IT BITES.', "IT'S OPEN. GO. MY SHIFT'S ALMOST OVER."],
  shitty: ['GO ON IN. THE FOG MACHINE WILL COVER THE SMELL. MOSTLY.', 'IN. GO IN. THE HALLS ACCEPT ALL WARRIORS. EVEN THE MOIST ONES.', "IT'S OPEN. BREATHE THROUGH YOUR MOUTH IN THERE. I MEAN FOR THEM."],
  nude: ['IN YOU GO. NAKED IN VALHALLA. VERY TRADITIONAL, ACTUALLY.', 'ENTER, WORTHY ONE. COVER THAT WITH A SHIELD OR SOMETHING.', "IT'S OPEN. GO. I'VE SEEN ENOUGH VIKING FOR ONE DAY."],
};

export const VOICE_LINES = pavilionVoices(TALK, HURT, [[V.viking, VIKING], [V.shield, SHIELD], [{ m: V.lutefisk.m, f: V.lutefisk.f }, LUTEFISK], [{ m: V.viking.m, f: V.viking.m }, TOLL], [{ m: DOORMAN_VOICE, f: DOORMAN_VOICE }, DOOR_DEMAND], [{ m: DOORMAN_VOICE, f: DOORMAN_VOICE }, DOOR_LEFT], [{ m: DOORMAN_VOICE, f: DOORMAN_VOICE }, DOOR_RAISE], [{ m: DOORMAN_VOICE, f: DOORMAN_VOICE }, DOOR_OPEN]], {
  meathead: [...PAID_GAG, ...allOf(DOOR_DEMAND_MH), ...allOf(DOOR_RAISE_MH)],
  [DOORMAN_VOICE]: DOOR_COUNT,
});
