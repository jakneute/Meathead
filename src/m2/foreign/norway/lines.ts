// What's said in Norway (the PA's hello, his lines, the cast's barks, what hurts him here), by voice.

import { pavilionVoices, type ByPants, type PavilionTalk, type HurtTable } from '../talk';

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

export const VOICE_LINES = pavilionVoices(TALK, HURT, [[V.viking, VIKING], [V.shield, SHIELD], [{ m: V.lutefisk.m, f: V.lutefisk.f }, LUTEFISK], [{ m: V.viking.m, f: V.viking.m }, TOLL]], { meathead: PAID_GAG });
